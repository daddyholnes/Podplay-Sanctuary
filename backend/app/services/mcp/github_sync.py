"""
GitHub MCP Package Sync Service.

This service handles synchronization with GitHub repositories to discover, index, 
and manage MCP packages hosted on GitHub.
"""

import asyncio
import json
import logging
import os
from datetime import datetime, timedelta, UTC
from typing import Dict, List, Optional, Any, Tuple

import aiohttp
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.mcp import (
    McpPackage, McpMarketplace, McpCategory, McpTag, 
    mcp_package_tags
)
from app.core.config import settings
from app.services.base import BaseService

logger = logging.getLogger(__name__)


class GitHubMcpSync(BaseService):
    """
    Service for synchronizing MCP packages from GitHub repositories.
    
    This service searches for repositories with the 'mcp-package' topic and
    processes them as MCP packages for the marketplace.
    """
    
    def __init__(self, session: AsyncSession):
        super().__init__(session)
        self.github_token = os.environ.get("MCP_GITHUB_TOKEN", "")
        self.marketplace_id = None
        self.sync_interval = timedelta(hours=6)
        self.last_sync = datetime.now(UTC) - self.sync_interval
        self.base_url = "https://api.github.com"
        self.topics = ["mcp-package", "mcp-tool", "podplay-mcp"]
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "Authorization": f"token {self.github_token}" if self.github_token else "",
            "User-Agent": "PodplayMcpSync/1.0"
        }
    
    async def initialize(self) -> None:
        """Initialize the GitHub MCP marketplace if it doesn't exist."""
        stmt = select(McpMarketplace).where(McpMarketplace.name == "GitHub")
        result = await self.session.execute(stmt)
        marketplace = result.scalar_one_or_none()
        
        if not marketplace:
            marketplace = McpMarketplace(
                name="GitHub",
                description="Packages from GitHub repositories",
                url="https://github.com/topics/mcp-package",
                icon_url="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
                enabled=True,
                metadata={
                    "provider": "github",
                    "topics": self.topics,
                    "auth_required": bool(self.github_token)
                }
            )
            self.session.add(marketplace)
            await self.session.commit()
            await self.session.refresh(marketplace)
        
        self.marketplace_id = marketplace.id
    
    async def sync(self, force: bool = False) -> Tuple[int, int, int]:
        """
        Synchronize MCP packages from GitHub.
        
        Args:
            force: Force sync even if the sync interval hasn't elapsed
            
        Returns:
            Tuple of (added, updated, removed) package counts
        """
        if not force and datetime.now(UTC) - self.last_sync < self.sync_interval:
            logger.info("Skipping GitHub sync, not enough time elapsed since last sync")
            return (0, 0, 0)
            
        if not self.marketplace_id:
            await self.initialize()
        
        added = 0
        updated = 0
        removed = 0
        
        try:
            # Get all existing GitHub packages
            stmt = select(McpPackage).where(McpPackage.marketplace_id == self.marketplace_id)
            result = await self.session.execute(stmt)
            existing_packages = {pkg.external_id: pkg for pkg in result.scalars().all()}
            
            # Fetch packages from GitHub
            packages = await self._fetch_github_packages()
            
            # Process each package
            for package_data in packages:
                external_id = package_data["id"]
                
                if external_id in existing_packages:
                    # Update existing package
                    updated_pkg = await self._update_package(existing_packages[external_id], package_data)
                    if updated_pkg:
                        updated += 1
                    del existing_packages[external_id]
                else:
                    # Add new package
                    await self._create_package(package_data)
                    added += 1
            
            # Remove packages that no longer exist
            for pkg in existing_packages.values():
                await self._remove_package(pkg)
                removed += 1
                
            self.last_sync = datetime.now(UTC)
            logger.info(f"GitHub sync completed: {added} added, {updated} updated, {removed} removed")
            return (added, updated, removed)
            
        except Exception as e:
            logger.error(f"Error syncing GitHub packages: {e}")
            return (0, 0, 0)
    
    async def _fetch_github_packages(self) -> List[Dict[str, Any]]:
        """
        Fetch MCP packages from GitHub using the GitHub API.
        
        Returns:
            List of package data dictionaries
        """
        packages = []
        
        async with aiohttp.ClientSession() as session:
            for topic in self.topics:
                page = 1
                per_page = 100
                has_more = True
                
                while has_more:
                    url = f"{self.base_url}/search/repositories"
                    params = {
                        "q": f"topic:{topic}",
                        "sort": "updated",
                        "order": "desc",
                        "page": page,
                        "per_page": per_page
                    }
                    
                    async with session.get(url, params=params, headers=self.headers) as response:
                        if response.status != 200:
                            logger.error(f"GitHub API error: {response.status} - {await response.text()}")
                            break
                            
                        data = await response.json()
                        items = data.get("items", [])
                        
                        if not items:
                            has_more = False
                            break
                            
                        # Process each repository
                        for repo in items:
                            package = await self._process_repository(session, repo)
                            if package:
                                packages.append(package)
                        
                        # Check if there are more pages
                        total_count = data.get("total_count", 0)
                        has_more = page * per_page < total_count
                        page += 1
        
        return packages
    
    async def _process_repository(
        self, 
        session: aiohttp.ClientSession, 
        repo: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Process a GitHub repository into an MCP package.
        
        Args:
            session: aiohttp client session
            repo: Repository data from GitHub API
            
        Returns:
            Package data dictionary or None if invalid
        """
        # Check for mcp-package.json file
        contents_url = f"{repo['contents_url'].replace('{+path}', 'mcp-package.json')}"
        
        async with session.get(contents_url, headers=self.headers) as response:
            if response.status != 200:
                # Try alternate file names
                alternates = ["mcp.json", "package.json", "podplay-mcp.json"]
                for alt in alternates:
                    alt_url = f"{repo['contents_url'].replace('{+path}', alt)}"
                    async with session.get(alt_url, headers=self.headers) as alt_response:
                        if alt_response.status == 200:
                            response = alt_response
                            break
                else:
                    # No valid package file found
                    return None
            
            content = await response.json()
            if "content" not in content:
                return None
                
            try:
                # Decode base64 content
                import base64
                package_json = json.loads(base64.b64decode(content["content"]).decode("utf-8"))
                
                # Extract readme if available
                readme_content = await self._fetch_readme(session, repo)
                
                # Parse the repository data into a package
                return {
                    "id": str(repo["id"]),
                    "name": package_json.get("name", repo["name"]),
                    "description": package_json.get("description", repo["description"]),
                    "version": package_json.get("version", "0.1.0"),
                    "author": package_json.get("author", repo["owner"]["login"]),
                    "repository": repo["html_url"],
                    "homepage": package_json.get("homepage", repo["homepage"]),
                    "license": package_json.get("license", "MIT"),
                    "stars": repo["stargazers_count"],
                    "forks": repo["forks_count"],
                    "watches": repo["watchers_count"],
                    "issues": repo["open_issues_count"],
                    "created_at": repo["created_at"],
                    "updated_at": repo["updated_at"],
                    "pushed_at": repo["pushed_at"],
                    "downloads": 0,  # GitHub doesn't provide download stats directly
                    "tags": repo["topics"] + package_json.get("keywords", []),
                    "category": package_json.get("category", "Tools"),
                    "readme": readme_content,
                    "metadata": {
                        "owner": repo["owner"]["login"],
                        "owner_url": repo["owner"]["html_url"],
                        "owner_avatar": repo["owner"]["avatar_url"],
                        "default_branch": repo["default_branch"],
                        "is_fork": repo["fork"],
                        "is_archived": repo["archived"],
                        "capabilities": package_json.get("capabilities", []),
                        "dependencies": package_json.get("dependencies", {}),
                        "mcp_config": package_json.get("mcp", {})
                    }
                }
            except Exception as e:
                logger.error(f"Error processing repo {repo['name']}: {e}")
                return None
    
    async def _fetch_readme(
        self, 
        session: aiohttp.ClientSession, 
        repo: Dict[str, Any]
    ) -> Optional[str]:
        """
        Fetch the README file from a GitHub repository.
        
        Args:
            session: aiohttp client session
            repo: Repository data from GitHub API
            
        Returns:
            README content as a string or None if not found
        """
        readme_url = f"{self.base_url}/repos/{repo['owner']['login']}/{repo['name']}/readme"
        
        async with session.get(readme_url, headers=self.headers) as response:
            if response.status != 200:
                return None
                
            try:
                data = await response.json()
                if "content" in data:
                    import base64
                    return base64.b64decode(data["content"]).decode("utf-8")
            except Exception as e:
                logger.error(f"Error fetching README for {repo['name']}: {e}")
                
        return None
    
    async def _create_package(self, package_data: Dict[str, Any]) -> Optional[McpPackage]:
        """
        Create a new MCP package from GitHub data.
        
        Args:
            package_data: Package data from GitHub
            
        Returns:
            Created McpPackage instance or None if failed
        """
        try:
            # Get or create category
            category_name = package_data["category"]
            stmt = select(McpCategory).where(McpCategory.name == category_name)
            result = await self.session.execute(stmt)
            category = result.scalar_one_or_none()
            
            if not category:
                category = McpCategory(
                    name=category_name,
                    description=f"{category_name} MCP packages",
                    icon="package"
                )
                self.session.add(category)
                await self.session.flush()
            
            # Create package
            package = McpPackage(
                name=package_data["name"],
                description=package_data["description"],
                version=package_data["version"],
                author=package_data["author"],
                license=package_data["license"],
                homepage=package_data["homepage"],
                repository=package_data["repository"],
                downloads=package_data["downloads"],
                stars=package_data["stars"],
                external_id=package_data["id"],
                marketplace_id=self.marketplace_id,
                category_id=category.id,
                readme=package_data["readme"],
                metadata=package_data["metadata"],
                enabled=True,
                published_at=datetime.fromisoformat(package_data["created_at"].replace("Z", "+00:00")),
                updated_at=datetime.fromisoformat(package_data["updated_at"].replace("Z", "+00:00"))
            )
            
            self.session.add(package)
            await self.session.flush()
            
            # Add tags
            await self._update_tags(package, package_data["tags"])
            
            await self.session.commit()
            await self.session.refresh(package)
            
            return package
        except Exception as e:
            await self.session.rollback()
            logger.error(f"Error creating package {package_data['name']}: {e}")
            return None
    
    async def _update_package(
        self, 
        package: McpPackage, 
        package_data: Dict[str, Any]
    ) -> bool:
        """
        Update an existing MCP package with new GitHub data.
        
        Args:
            package: Existing McpPackage instance
            package_data: New package data from GitHub
            
        Returns:
            True if successfully updated, False otherwise
        """
        try:
            # Check if package needs updating
            updated_at = datetime.fromisoformat(package_data["updated_at"].replace("Z", "+00:00"))
            if package.updated_at and package.updated_at >= updated_at:
                return False
                
            # Get or create category
            category_name = package_data["category"]
            stmt = select(McpCategory).where(McpCategory.name == category_name)
            result = await self.session.execute(stmt)
            category = result.scalar_one_or_none()
            
            if not category:
                category = McpCategory(
                    name=category_name,
                    description=f"{category_name} MCP packages",
                    icon="package"
                )
                self.session.add(category)
                await self.session.flush()
            
            # Update package
            package.name = package_data["name"]
            package.description = package_data["description"]
            package.version = package_data["version"]
            package.author = package_data["author"]
            package.license = package_data["license"]
            package.homepage = package_data["homepage"]
            package.repository = package_data["repository"]
            package.stars = package_data["stars"]
            package.category_id = category.id
            package.readme = package_data["readme"]
            package.metadata = package_data["metadata"]
            package.updated_at = updated_at
            
            # Update tags
            await self._update_tags(package, package_data["tags"])
            
            await self.session.commit()
            await self.session.refresh(package)
            
            return True
        except Exception as e:
            await self.session.rollback()
            logger.error(f"Error updating package {package.name}: {e}")
            return False
    
    async def _remove_package(self, package: McpPackage) -> bool:
        """
        Remove an MCP package that no longer exists on GitHub.
        
        Args:
            package: McpPackage instance to remove
            
        Returns:
            True if successfully removed, False otherwise
        """
        try:
            # Remove tag associations
            stmt = delete(mcp_package_tags).where(mcp_package_tags.c.package_id == package.id)
            await self.session.execute(stmt)
            
            # Remove package
            await self.session.delete(package)
            await self.session.commit()
            
            return True
        except Exception as e:
            await self.session.rollback()
            logger.error(f"Error removing package {package.name}: {e}")
            return False
    
    async def _update_tags(self, package: McpPackage, tag_names: List[str]) -> None:
        """
        Update the tags associated with an MCP package.
        
        Args:
            package: McpPackage instance
            tag_names: List of tag names
        """
        # Remove existing tag associations
        stmt = delete(mcp_package_tags).where(mcp_package_tags.c.package_id == package.id)
        await self.session.execute(stmt)
        
        # Create tags that don't exist
        for tag_name in tag_names:
            stmt = select(McpTag).where(McpTag.name == tag_name)
            result = await self.session.execute(stmt)
            tag = result.scalar_one_or_none()
            
            if not tag:
                tag = McpTag(name=tag_name)
                self.session.add(tag)
                await self.session.flush()
            
            # Add tag association
            stmt = mcp_package_tags.insert().values(
                package_id=package.id, 
                tag_id=tag.id
            )
            await self.session.execute(stmt)
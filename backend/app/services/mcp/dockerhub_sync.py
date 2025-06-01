"""
Docker Hub MCP Package Sync Service.

This service handles synchronization with Docker Hub repositories to discover, index, 
and manage MCP packages hosted as Docker containers.
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


class DockerHubMcpSync(BaseService):
    """
    Service for synchronizing MCP packages from Docker Hub repositories.
    
    This service searches for repositories with specific tags or labels
    indicating they are MCP packages.
    """
    
    def __init__(self, session: AsyncSession):
        super().__init__(session)
        self.dockerhub_username = os.environ.get("MCP_DOCKERHUB_USERNAME", "")
        self.dockerhub_password = os.environ.get("MCP_DOCKERHUB_PASSWORD", "")
        self.marketplace_id = None
        self.sync_interval = timedelta(hours=12)
        self.last_sync = datetime.now(UTC) - self.sync_interval
        self.base_url = "https://hub.docker.com/v2"
        self.api_url = "https://registry.hub.docker.com/v2"
        self.namespaces = ["mcptools", "podplay", "mcppackages"]
        self.token = None
        self.token_expires = datetime.now(UTC)
    
    async def initialize(self) -> None:
        """Initialize the Docker Hub MCP marketplace if it doesn't exist."""
        stmt = select(McpMarketplace).where(McpMarketplace.name == "Docker Hub")
        result = await self.session.execute(stmt)
        marketplace = result.scalar_one_or_none()
        
        if not marketplace:
            marketplace = McpMarketplace(
                name="Docker Hub",
                description="MCP packages from Docker Hub containers",
                url="https://hub.docker.com/search?q=mcp&type=image",
                icon_url="https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png",
                enabled=True,
                metadata={
                    "provider": "dockerhub",
                    "namespaces": self.namespaces,
                    "auth_required": bool(self.dockerhub_username and self.dockerhub_password)
                }
            )
            self.session.add(marketplace)
            await self.session.commit()
            await self.session.refresh(marketplace)
        
        self.marketplace_id = marketplace.id
    
    async def _get_auth_token(self, session: aiohttp.ClientSession) -> Optional[str]:
        """
        Get authentication token from Docker Hub.
        
        Args:
            session: aiohttp client session
            
        Returns:
            Authentication token or None if authentication failed
        """
        if not self.dockerhub_username or not self.dockerhub_password:
            return None
            
        if self.token and datetime.now(UTC) < self.token_expires:
            return self.token
            
        url = f"{self.base_url}/users/login"
        payload = {
            "username": self.dockerhub_username,
            "password": self.dockerhub_password
        }
        
        try:
            async with session.post(url, json=payload) as response:
                if response.status != 200:
                    logger.error(f"Docker Hub authentication failed: {response.status}")
                    return None
                    
                data = await response.json()
                self.token = data.get("token")
                
                # Token expires in 24 hours
                self.token_expires = datetime.now(UTC) + timedelta(hours=23)
                
                return self.token
        except Exception as e:
            logger.error(f"Error authenticating with Docker Hub: {e}")
            return None
    
    async def sync(self, force: bool = False) -> Tuple[int, int, int]:
        """
        Synchronize MCP packages from Docker Hub.
        
        Args:
            force: Force sync even if the sync interval hasn't elapsed
            
        Returns:
            Tuple of (added, updated, removed) package counts
        """
        if not force and datetime.now(UTC) - self.last_sync < self.sync_interval:
            logger.info("Skipping Docker Hub sync, not enough time elapsed since last sync")
            return (0, 0, 0)
            
        if not self.marketplace_id:
            await self.initialize()
        
        added = 0
        updated = 0
        removed = 0
        
        try:
            # Get all existing Docker Hub packages
            stmt = select(McpPackage).where(McpPackage.marketplace_id == self.marketplace_id)
            result = await self.session.execute(stmt)
            existing_packages = {pkg.external_id: pkg for pkg in result.scalars().all()}
            
            # Fetch packages from Docker Hub
            packages = await self._fetch_dockerhub_packages()
            
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
            logger.info(f"Docker Hub sync completed: {added} added, {updated} updated, {removed} removed")
            return (added, updated, removed)
            
        except Exception as e:
            logger.error(f"Error syncing Docker Hub packages: {e}")
            return (0, 0, 0)
    
    async def _fetch_dockerhub_packages(self) -> List[Dict[str, Any]]:
        """
        Fetch MCP packages from Docker Hub using the Docker Hub API.
        
        Returns:
            List of package data dictionaries
        """
        packages = []
        
        async with aiohttp.ClientSession() as session:
            # Get authentication token if credentials are provided
            token = await self._get_auth_token(session)
            headers = {"Authorization": f"Bearer {token}"} if token else {}
            
            # Search for packages in each namespace
            for namespace in self.namespaces:
                # Also search for specific labels
                search_terms = [namespace, "mcp", "podplay", "mcp-package"]
                
                for term in search_terms:
                    page = 1
                    page_size = 100
                    has_more = True
                    
                    while has_more:
                        url = f"{self.base_url}/search/repositories"
                        params = {
                            "query": term,
                            "page": page,
                            "page_size": page_size,
                            "type": "image"
                        }
                        
                        async with session.get(url, params=params, headers=headers) as response:
                            if response.status != 200:
                                logger.error(f"Docker Hub API error: {response.status} - {await response.text()}")
                                break
                                
                            data = await response.json()
                            results = data.get("results", [])
                            
                            if not results:
                                has_more = False
                                break
                                
                            # Process each repository
                            for repo in results:
                                # Check if this is an MCP package
                                if await self._is_mcp_package(session, repo, headers):
                                    package = await self._process_repository(session, repo, headers)
                                    if package:
                                        packages.append(package)
                            
                            # Check if there are more pages
                            has_more = page * page_size < data.get("count", 0)
                            page += 1
        
        return packages
    
    async def _is_mcp_package(
        self, 
        session: aiohttp.ClientSession, 
        repo: Dict[str, Any],
        headers: Dict[str, str]
    ) -> bool:
        """
        Check if a Docker Hub repository is an MCP package.
        
        Args:
            session: aiohttp client session
            repo: Repository data from Docker Hub API
            headers: Request headers including authorization
            
        Returns:
            True if the repository is an MCP package, False otherwise
        """
        # Check namespace
        repo_namespace = repo.get("namespace", "")
        if repo_namespace in self.namespaces:
            return True
            
        # Check labels
        tags_url = f"{self.base_url}/repositories/{repo_namespace}/{repo.get('name', '')}/tags"
        
        try:
            async with session.get(tags_url, headers=headers) as response:
                if response.status != 200:
                    return False
                    
                data = await response.json()
                results = data.get("results", [])
                
                if not results:
                    return False
                
                # Check if any tag has MCP-related labels
                for tag in results:
                    if tag.get("name") == "latest":
                        images = tag.get("images", [])
                        if not images:
                            continue
                            
                        # Get image details and check labels
                        digest = images[0].get("digest", "")
                        if not digest:
                            continue
                            
                        manifest_url = f"{self.api_url}/repositories/{repo_namespace}/{repo.get('name', '')}/manifests/{digest}"
                        
                        async with session.get(manifest_url, headers=headers) as manifest_response:
                            if manifest_response.status != 200:
                                continue
                                
                            manifest = await manifest_response.json()
                            labels = manifest.get("config", {}).get("Labels", {})
                            
                            # Check for MCP-related labels
                            for key in labels:
                                if any(mcp_term in key.lower() for mcp_term in ["mcp", "podplay", "model-context-protocol"]):
                                    return True
        except Exception as e:
            logger.error(f"Error checking if {repo.get('name')} is an MCP package: {e}")
            
        return False
    
    async def _process_repository(
        self, 
        session: aiohttp.ClientSession, 
        repo: Dict[str, Any],
        headers: Dict[str, str]
    ) -> Optional[Dict[str, Any]]:
        """
        Process a Docker Hub repository into an MCP package.
        
        Args:
            session: aiohttp client session
            repo: Repository data from Docker Hub API
            headers: Request headers including authorization
            
        Returns:
            Package data dictionary or None if invalid
        """
        try:
            repo_namespace = repo.get("namespace", "")
            repo_name = repo.get("name", "")
            
            # Get repository details
            repo_url = f"{self.base_url}/repositories/{repo_namespace}/{repo_name}"
            
            async with session.get(repo_url, headers=headers) as response:
                if response.status != 200:
                    logger.error(f"Error getting repository details: {response.status}")
                    return None
                    
                repo_details = await response.json()
                
                # Get latest tag details
                tags_url = f"{self.base_url}/repositories/{repo_namespace}/{repo_name}/tags"
                
                async with session.get(tags_url, headers=headers) as tags_response:
                    if tags_response.status != 200:
                        logger.error(f"Error getting tags: {tags_response.status}")
                        return None
                        
                    tags_data = await tags_response.json()
                    tags = tags_data.get("results", [])
                    
                    if not tags:
                        return None
                        
                    # Find the latest tag
                    latest_tag = None
                    for tag in tags:
                        if tag.get("name") == "latest":
                            latest_tag = tag
                            break
                    
                    if not latest_tag:
                        latest_tag = tags[0]
                    
                    # Extract metadata from tag
                    last_updated = latest_tag.get("last_updated", repo_details.get("last_updated"))
                    
                    # Parse description from repository or label
                    description = repo_details.get("description", "")
                    
                    # Get README if available
                    readme = await self._fetch_readme(session, repo_namespace, repo_name, headers)
                    
                    # Extract any custom labels from the image
                    metadata = {
                        "provider": "dockerhub",
                        "pull_count": repo_details.get("pull_count", 0),
                        "star_count": repo_details.get("star_count", 0),
                        "is_private": repo_details.get("is_private", False),
                        "status": repo_details.get("status", 1),
                        "image_count": len(tags),
                        "hub_url": f"https://hub.docker.com/r/{repo_namespace}/{repo_name}",
                        "dockerfile_url": f"https://hub.docker.com/layers/{repo_namespace}/{repo_name}/latest/images/sha256-{latest_tag.get('images', [{}])[0].get('digest', '')}?context=explore",
                        "labels": {},
                        "capabilities": []
                    }
                    
                    # Get labels from the image if available
                    try:
                        # Extract any MCP capabilities from labels
                        for tag in tags:
                            if tag.get("name") == "latest":
                                images = tag.get("images", [])
                                if not images:
                                    continue
                                    
                                digest = images[0].get("digest", "")
                                if not digest:
                                    continue
                                    
                                manifest_url = f"{self.api_url}/repositories/{repo_namespace}/{repo_name}/manifests/{digest}"
                                
                                async with session.get(manifest_url, headers=headers) as manifest_response:
                                    if manifest_response.status != 200:
                                        continue
                                        
                                    manifest = await manifest_response.json()
                                    labels = manifest.get("config", {}).get("Labels", {})
                                    
                                    if labels:
                                        metadata["labels"] = labels
                                        
                                        # Extract capabilities
                                        if "mcp.capabilities" in labels:
                                            try:
                                                capabilities = json.loads(labels["mcp.capabilities"])
                                                metadata["capabilities"] = capabilities
                                            except:
                                                pass
                                                
                                        # Extract description if not already set
                                        if not description and "mcp.description" in labels:
                                            description = labels["mcp.description"]
                    except Exception as e:
                        logger.error(f"Error extracting labels: {e}")
                    
                    # Determine appropriate category
                    category = "Docker Containers"
                    if "mcp.category" in metadata.get("labels", {}):
                        category = metadata["labels"]["mcp.category"]
                    elif any(cap.lower() in ["llm", "ai", "model"] for cap in metadata.get("capabilities", [])):
                        category = "AI Models"
                    elif any(cap.lower() in ["tool", "utility"] for cap in metadata.get("capabilities", [])):
                        category = "Tools"
                    
                    # Extract tags
                    tag_list = repo_details.get("labels", [])
                    tag_list.extend([
                        "docker", 
                        "container", 
                        repo_namespace, 
                        repo_name
                    ])
                    
                    # Add any capabilities as tags
                    tag_list.extend(metadata.get("capabilities", []))
                    
                    # Extract version from tag or labels
                    version = "latest"
                    if "mcp.version" in metadata.get("labels", {}):
                        version = metadata["labels"]["mcp.version"]
                    
                    # Create package data
                    return {
                        "id": str(repo_details.get("id", f"{repo_namespace}/{repo_name}")),
                        "name": repo_details.get("name", repo_name),
                        "description": description,
                        "version": version,
                        "author": repo_details.get("namespace", repo_namespace),
                        "repository": f"https://hub.docker.com/r/{repo_namespace}/{repo_name}",
                        "homepage": repo_details.get("homepage", ""),
                        "license": metadata.get("labels", {}).get("mcp.license", "Proprietary"),
                        "stars": repo_details.get("star_count", 0),
                        "downloads": repo_details.get("pull_count", 0),
                        "created_at": repo_details.get("date_registered", last_updated),
                        "updated_at": last_updated,
                        "tags": tag_list,
                        "category": category,
                        "readme": readme,
                        "metadata": metadata
                    }
        except Exception as e:
            logger.error(f"Error processing Docker Hub repository {repo.get('name')}: {e}")
            return None
    
    async def _fetch_readme(
        self, 
        session: aiohttp.ClientSession, 
        namespace: str,
        name: str,
        headers: Dict[str, str]
    ) -> Optional[str]:
        """
        Fetch the README file from a Docker Hub repository.
        
        Args:
            session: aiohttp client session
            namespace: Repository namespace
            name: Repository name
            headers: Request headers including authorization
            
        Returns:
            README content as a string or None if not found
        """
        readme_url = f"{self.base_url}/repositories/{namespace}/{name}/readme"
        
        try:
            async with session.get(readme_url, headers=headers) as response:
                if response.status != 200:
                    return None
                    
                data = await response.json()
                return data.get("full_description", "")
        except Exception as e:
            logger.error(f"Error fetching README for {namespace}/{name}: {e}")
            
        return None
    
    async def _create_package(self, package_data: Dict[str, Any]) -> Optional[McpPackage]:
        """
        Create a new MCP package from Docker Hub data.
        
        Args:
            package_data: Package data from Docker Hub
            
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
                description=package_data["description"] or f"Docker container for {package_data['name']}",
                version=package_data["version"],
                author=package_data["author"],
                license=package_data["license"],
                homepage=package_data["homepage"] or package_data["repository"],
                repository=package_data["repository"],
                downloads=package_data["downloads"],
                stars=package_data["stars"],
                external_id=package_data["id"],
                marketplace_id=self.marketplace_id,
                category_id=category.id,
                readme=package_data["readme"] or f"# {package_data['name']}\n\n{package_data['description']}",
                metadata=package_data["metadata"],
                enabled=True,
                published_at=datetime.fromisoformat(package_data["created_at"].replace("Z", "+00:00")) if isinstance(package_data["created_at"], str) else datetime.now(UTC),
                updated_at=datetime.fromisoformat(package_data["updated_at"].replace("Z", "+00:00")) if isinstance(package_data["updated_at"], str) else datetime.now(UTC)
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
        Update an existing MCP package with new Docker Hub data.
        
        Args:
            package: Existing McpPackage instance
            package_data: New package data from Docker Hub
            
        Returns:
            True if successfully updated, False otherwise
        """
        try:
            # Check if package needs updating
            updated_at = datetime.fromisoformat(package_data["updated_at"].replace("Z", "+00:00")) if isinstance(package_data["updated_at"], str) else datetime.now(UTC)
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
            package.description = package_data["description"] or package.description
            package.version = package_data["version"]
            package.author = package_data["author"]
            package.license = package_data["license"]
            package.homepage = package_data["homepage"] or package.homepage
            package.repository = package_data["repository"]
            package.stars = package_data["stars"]
            package.downloads = package_data["downloads"]
            package.category_id = category.id
            package.readme = package_data["readme"] or package.readme
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
        Remove an MCP package that no longer exists on Docker Hub.
        
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
            if not tag_name or len(tag_name) > 50:  # Skip empty or too long tags
                continue
                
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
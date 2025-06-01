"""
MCP Marketplace Sync Service.

This service coordinates synchronization of MCP packages from various sources
including GitHub repositories and Docker Hub containers.
"""

import asyncio
import logging
from datetime import datetime, timedelta, UTC
from typing import Dict, List, Optional, Any, Tuple, Set

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.mcp import McpMarketplace, McpPackage
from app.services.base import BaseService
from .github_sync import GitHubMcpSync
from .dockerhub_sync import DockerHubMcpSync

logger = logging.getLogger(__name__)


class MarketplaceSync(BaseService):
    """
    Service for synchronizing MCP packages from multiple marketplaces.
    
    This service coordinates sync operations for different package sources
    and provides a unified interface for package discovery and updates.
    """
    
    def __init__(self, session: AsyncSession):
        super().__init__(session)
        self.github_sync = GitHubMcpSync(session)
        self.dockerhub_sync = DockerHubMcpSync(session)
        self.last_sync = datetime.now(UTC) - timedelta(days=1)
        self.sync_interval = timedelta(hours=6)
        self.is_syncing = False
        self.sync_stats = {
            "last_sync": None,
            "next_sync": None,
            "total_added": 0,
            "total_updated": 0,
            "total_removed": 0,
            "marketplaces": {}
        }
        
    async def initialize(self) -> None:
        """Initialize all marketplace sync services."""
        await self.github_sync.initialize()
        await self.dockerhub_sync.initialize()
        
    async def sync_all(self, force: bool = False) -> Dict[str, Any]:
        """
        Synchronize packages from all marketplaces.
        
        Args:
            force: Force sync even if the sync interval hasn't elapsed
            
        Returns:
            Dictionary with sync statistics
        """
        if self.is_syncing:
            logger.info("Sync already in progress, skipping")
            return {
                "status": "in_progress",
                "stats": self.sync_stats
            }
            
        if not force and datetime.now(UTC) - self.last_sync < self.sync_interval:
            logger.info("Skipping marketplace sync, not enough time elapsed since last sync")
            return {
                "status": "skipped",
                "stats": self.sync_stats,
                "message": "Not enough time elapsed since last sync"
            }
            
        self.is_syncing = True
        self.sync_stats["last_sync"] = datetime.now(UTC).isoformat()
        self.sync_stats["next_sync"] = (datetime.now(UTC) + self.sync_interval).isoformat()
        
        try:
            # Sync GitHub packages
            logger.info("Starting GitHub sync")
            github_added, github_updated, github_removed = await self.github_sync.sync(force)
            
            self.sync_stats["marketplaces"]["github"] = {
                "added": github_added,
                "updated": github_updated,
                "removed": github_removed,
                "timestamp": datetime.now(UTC).isoformat()
            }
            
            # Sync Docker Hub packages
            logger.info("Starting Docker Hub sync")
            dockerhub_added, dockerhub_updated, dockerhub_removed = await self.dockerhub_sync.sync(force)
            
            self.sync_stats["marketplaces"]["dockerhub"] = {
                "added": dockerhub_added,
                "updated": dockerhub_updated,
                "removed": dockerhub_removed,
                "timestamp": datetime.now(UTC).isoformat()
            }
            
            # Update total stats
            self.sync_stats["total_added"] = github_added + dockerhub_added
            self.sync_stats["total_updated"] = github_updated + dockerhub_updated
            self.sync_stats["total_removed"] = github_removed + dockerhub_removed
            
            self.last_sync = datetime.now(UTC)
            logger.info(f"Marketplace sync completed: {self.sync_stats['total_added']} added, {self.sync_stats['total_updated']} updated, {self.sync_stats['total_removed']} removed")
            
            return {
                "status": "completed",
                "stats": self.sync_stats
            }
        except Exception as e:
            logger.error(f"Error during marketplace sync: {e}")
            return {
                "status": "error",
                "message": str(e),
                "stats": self.sync_stats
            }
        finally:
            self.is_syncing = False
            
    async def sync_marketplace(self, marketplace_name: str, force: bool = False) -> Dict[str, Any]:
        """
        Synchronize packages from a specific marketplace.
        
        Args:
            marketplace_name: Name of the marketplace to sync
            force: Force sync even if the sync interval hasn't elapsed
            
        Returns:
            Dictionary with sync statistics
        """
        if self.is_syncing:
            logger.info(f"Sync already in progress, skipping {marketplace_name} sync")
            return {
                "status": "in_progress",
                "stats": self.sync_stats.get("marketplaces", {}).get(marketplace_name.lower(), {})
            }
            
        self.is_syncing = True
        
        try:
            if marketplace_name.lower() == "github":
                added, updated, removed = await self.github_sync.sync(force)
                marketplace_key = "github"
            elif marketplace_name.lower() in ["dockerhub", "docker hub", "docker"]:
                added, updated, removed = await self.dockerhub_sync.sync(force)
                marketplace_key = "dockerhub"
            else:
                self.is_syncing = False
                return {
                    "status": "error",
                    "message": f"Unknown marketplace: {marketplace_name}"
                }
                
            # Update marketplace stats
            self.sync_stats["marketplaces"][marketplace_key] = {
                "added": added,
                "updated": updated,
                "removed": removed,
                "timestamp": datetime.now(UTC).isoformat()
            }
            
            # Update total stats
            self.sync_stats["total_added"] = sum(m.get("added", 0) for m in self.sync_stats["marketplaces"].values())
            self.sync_stats["total_updated"] = sum(m.get("updated", 0) for m in self.sync_stats["marketplaces"].values())
            self.sync_stats["total_removed"] = sum(m.get("removed", 0) for m in self.sync_stats["marketplaces"].values())
            
            logger.info(f"{marketplace_name} sync completed: {added} added, {updated} updated, {removed} removed")
            
            return {
                "status": "completed",
                "marketplace": marketplace_name,
                "stats": {
                    "added": added,
                    "updated": updated,
                    "removed": removed,
                    "timestamp": datetime.now(UTC).isoformat()
                }
            }
        except Exception as e:
            logger.error(f"Error during {marketplace_name} sync: {e}")
            return {
                "status": "error",
                "marketplace": marketplace_name,
                "message": str(e)
            }
        finally:
            self.is_syncing = False
            
    async def get_stats(self) -> Dict[str, Any]:
        """
        Get current sync statistics.
        
        Returns:
            Dictionary with sync statistics
        """
        return {
            "is_syncing": self.is_syncing,
            "last_sync": self.last_sync.isoformat() if self.last_sync else None,
            "next_sync": (self.last_sync + self.sync_interval).isoformat() if self.last_sync else None,
            "stats": self.sync_stats
        }
        
    async def start_background_sync(self) -> None:
        """Start a background task for periodic marketplace synchronization."""
        asyncio.create_task(self._background_sync_task())
        
    async def _background_sync_task(self) -> None:
        """Background task for periodic marketplace synchronization."""
        logger.info("Starting background marketplace sync task")
        
        while True:
            try:
                # Check if it's time to sync
                if datetime.now(UTC) - self.last_sync >= self.sync_interval:
                    logger.info("Running scheduled marketplace sync")
                    await self.sync_all()
                    
                # Sleep for a while before checking again
                await asyncio.sleep(60 * 15)  # Check every 15 minutes
            except Exception as e:
                logger.error(f"Error in background sync task: {e}")
                await asyncio.sleep(60 * 5)  # Wait 5 minutes before retrying on error
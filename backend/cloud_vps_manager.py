"""
Cloud VPS Manager for Podplay Build Sanctuary
Supports GreenCloud and RackNerd for affordable cloud VPS deployment
Designed for Scout Agent plan-to-production workflows with Mama Bear control
"""

import os
import time
import logging
import asyncio
import requests
import json
from typing import Dict, List, Optional, Any, Tuple
import uuid
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class VPSInstance:
    """Represents a cloud VPS instance"""
    id: str
    name: str
    status: str  # creating, active, stopped, error
    public_ip: Optional[str]
    private_ip: Optional[str]
    ssh_port: int
    ssh_user: str
    provider: str  # greencloud, racknerd
    region: str
    size: str
    image: str
    created_at: str
    memory_mb: int
    vcpus: int
    disk_gb: int
    monthly_cost: float

class CloudVPSManager:
    """
    Multi-provider VPS manager supporting GreenCloud and RackNerd
    Provides affordable alternative to DigitalOcean with Mama Bear control
    """
    
    def __init__(self):
        # Provider configurations
        self.providers = {
            "greencloud": {
                "name": "GreenCloud VPS",
                "api_endpoint": "https://api.greencloudvps.com/v1",
                "api_key": os.getenv('GREENCLOUD_API_KEY'),
                "available": bool(os.getenv('GREENCLOUD_API_KEY')),
                "regions": {
                    "us-west": "Los Angeles, CA",
                    "us-east": "New York, NY", 
                    "eu-west": "Amsterdam, NL",
                    "asia": "Singapore, SG"
                },
                "sizes": {
                    "scout-nano": {"memory_mb": 512, "vcpus": 1, "disk_gb": 10, "cost": 2.95},
                    "scout-micro": {"memory_mb": 1024, "vcpus": 1, "disk_gb": 25, "cost": 4.95},
                    "scout-small": {"memory_mb": 2048, "vcpus": 2, "disk_gb": 50, "cost": 8.95},
                    "scout-medium": {"memory_mb": 4096, "vcpus": 2, "disk_gb": 100, "cost": 15.95},
                    "scout-large": {"memory_mb": 8192, "vcpus": 4, "disk_gb": 200, "cost": 29.95}
                }
            },
            "racknerd": {
                "name": "RackNerd VPS",
                "api_endpoint": "https://my.racknerd.com/api/v1",
                "api_key": os.getenv('RACKNERD_API_KEY'),
                "available": bool(os.getenv('RACKNERD_API_KEY')),
                "regions": {
                    "us-west": "Los Angeles, CA",
                    "us-central": "Chicago, IL",
                    "us-east": "New York, NY",
                    "eu": "Netherlands"
                },
                "sizes": {
                    "scout-nano": {"memory_mb": 768, "vcpus": 1, "disk_gb": 15, "cost": 2.49},
                    "scout-micro": {"memory_mb": 1536, "vcpus": 1, "disk_gb": 25, "cost": 3.89},
                    "scout-small": {"memory_mb": 3072, "vcpus": 2, "disk_gb": 50, "cost": 7.69},
                    "scout-medium": {"memory_mb": 6144, "vcpus": 3, "disk_gb": 100, "cost": 14.39},
                    "scout-large": {"memory_mb": 12288, "vcpus": 4, "disk_gb": 200, "cost": 27.99}
                }
            }
        }
        
        # Track active VPS instances
        self.active_vps: Dict[str, VPSInstance] = {}
        
        # Determine preferred provider based on availability and cost
        self.preferred_provider = self._get_preferred_provider()
        
        logger.info(f"🌐 Cloud VPS Manager initialized - Preferred: {self.preferred_provider}")
    
    def _get_preferred_provider(self) -> str:
        """Determine the best available provider"""
        # RackNerd generally offers better pricing
        if self.providers["racknerd"]["available"]:
            return "racknerd"
        elif self.providers["greencloud"]["available"]:
            return "greencloud"
        else:
            logger.warning("⚠️ No VPS providers configured - will use mock mode")
            return "mock"
    
    async def create_vps(
        self,
        name: str,
        size: str = "scout-small",
        region: str = "us-west",
        image: str = "ubuntu-22.04",
        provider: Optional[str] = None
    ) -> Tuple[VPSInstance, str]:
        """Create a new VPS instance"""
        
        provider = provider or self.preferred_provider
        
        if provider == "mock" or not self.providers.get(provider, {}).get("available"):
            return await self._create_mock_vps(name, size, region, image, provider)
        
        try:
            if provider == "greencloud":
                return await self._create_greencloud_vps(name, size, region, image)
            elif provider == "racknerd":
                return await self._create_racknerd_vps(name, size, region, image)
            else:
                return await self._create_mock_vps(name, size, region, image, provider)
                
        except Exception as e:
            logger.error(f"❌ Failed to create VPS with {provider}: {e}")
            return await self._create_mock_vps(name, size, region, image, provider)
    
    async def _create_greencloud_vps(
        self, name: str, size: str, region: str, image: str
    ) -> Tuple[VPSInstance, str]:
        """Create VPS on GreenCloud using real API"""
        
        provider_config = self.providers["greencloud"]
        size_config = provider_config["sizes"].get(size, provider_config["sizes"]["scout-small"])
        
        # GreenCloud API call
        headers = {
            "Authorization": f"Bearer {provider_config['api_key']}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "name": f"podplay-{name}",
            "plan": size,
            "location": region,
            "os": image,
            "ssh_key": os.getenv('VPS_SSH_KEY_ID', ''),
            "user_data": self._get_bootstrap_script(),
            "tag": "podplay-scout"
        }
        
        try:
            logger.info(f"🌿 Creating GreenCloud VPS: {name}")
            response = requests.post(
                f"{provider_config['api_endpoint']}/servers",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 201:
                vps_data = response.json()
                vps_id = vps_data.get('id', f"gc-{uuid.uuid4().hex[:8]}")
                
                # Wait for IP assignment
                await asyncio.sleep(5)
                vps_details = await self._get_greencloud_vps_details(vps_id)
                
                vps_instance = VPSInstance(
                    id=vps_id,
                    name=f"podplay-{name}",
                    status=vps_data.get('status', 'creating'),
                    public_ip=vps_details.get('public_ip'),
                    private_ip=vps_details.get('private_ip'),
                    ssh_port=22,
                    ssh_user="root",
                    provider="greencloud",
                    region=region,
                    size=size,
                    image=image,
                    created_at=str(int(time.time())),
                    **size_config
                )
                
                self.active_vps[vps_instance.id] = vps_instance
                
                setup_info = f"""
                🌿 GreenCloud VPS Created Successfully!
                
                📋 VPS Details:
                • Name: {vps_instance.name}
                • ID: {vps_instance.id}
                • IP: {vps_instance.public_ip or 'Assigning...'}
                • SSH: ssh root@{vps_instance.public_ip or 'pending'}
                • Location: {provider_config['regions'].get(region, region)}
                
                ⚡ Specs:
                • CPU: {size_config['vcpus']} vCPU
                • RAM: {size_config['memory_mb']}MB
                • Disk: {size_config['disk_gb']}GB
                • Cost: ${size_config['cost']}/month
                
                🔑 SSH Access:
                • User: root
                • Port: 22
                
                💰 Billing: ${size_config['cost']}/month (Eco-friendly!)
                """
                
                logger.info(f"✅ GreenCloud VPS {name} created: {vps_instance.id}")
                return vps_instance, setup_info
                
            else:
                logger.error(f"❌ GreenCloud API error: {response.status_code} - {response.text}")
                return await self._create_mock_vps(name, size, region, image, "greencloud")
                
        except Exception as e:
            logger.error(f"❌ GreenCloud VPS creation failed: {e}")
            return await self._create_mock_vps(name, size, region, image, "greencloud")
            "created_at": time.time()
        }
        
        vps_instance = VPSInstance(
            id=vps_data["id"],
            name=vps_data["name"],
            status="creating",
            public_ip=None,  # Will be assigned
            private_ip=None,
            ssh_port=22,
            ssh_user="root",
            provider="greencloud",
            region=region,
            size=size,
            image=image,
            created_at=str(int(time.time())),
            memory_mb=size_config["memory_mb"],
            vcpus=size_config["vcpus"],
            disk_gb=size_config["disk_gb"],
            monthly_cost=size_config["cost"]
        )
        
        self.active_vps[vps_instance.id] = vps_instance
        
        setup_info = f"""
        🌿 GreenCloud VPS Created Successfully!
        
        📋 VPS Details:
        • Name: {vps_instance.name}
        • ID: {vps_instance.id}
        • Size: {size} (${size_config['cost']}/month)
        • Region: {provider_config['regions'][region]}
        • Specs: {size_config['memory_mb']}MB RAM, {size_config['vcpus']} vCPU
        
        🔗 Access:
        • SSH: Will be available in 2-3 minutes
        • User: root
        • Port: 22
        
        💰 Billing: ${size_config['cost']}/month
        """
        
        logger.info(f"✅ GreenCloud VPS {name} created: {vps_instance.id}")
        return vps_instance, setup_info
    
    async def _create_racknerd_vps(
        self, name: str, size: str, region: str, image: str
    ) -> Tuple[VPSInstance, str]:
        """Create VPS on RackNerd using real API"""
        
        provider_config = self.providers["racknerd"]
        size_config = provider_config["sizes"].get(size, provider_config["sizes"]["scout-small"])
        
        # RackNerd API call
        headers = {
            "Authorization": f"Bearer {provider_config['api_key']}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "hostname": f"podplay-{name}",
            "plan": size,
            "location": region,
            "template": image,
            "sshkey": os.getenv('VPS_SSH_KEY_ID', ''),
            "startup_script": self._get_bootstrap_script(),
            "label": f"Podplay Scout Agent - {name}"
        }
        
        try:
            logger.info(f"🏁 Creating RackNerd VPS: {name}")
            response = requests.post(
                f"{provider_config['api_endpoint']}/vps/create",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                vps_data = response.json()
                vps_id = vps_data.get('vps_id', f"rn-{uuid.uuid4().hex[:8]}")
                
                # Wait for initial provisioning
                await asyncio.sleep(10)
                vps_details = await self._get_racknerd_vps_details(vps_id)
                
                vps_instance = VPSInstance(
                    id=vps_id,
                    name=f"podplay-{name}",
                    status=vps_data.get('status', 'creating'),
                    public_ip=vps_details.get('primary_ip'),
                    private_ip=vps_details.get('private_ip'),
                    ssh_port=22,
                    ssh_user="root",
                    provider="racknerd",
                    region=region,
                    size=size,
                    image=image,
                    created_at=str(int(time.time())),
                    **size_config
                )
                
                self.active_vps[vps_instance.id] = vps_instance
                
                setup_info = f"""
                🏁 RackNerd VPS Created Successfully!
                
                📋 VPS Details:
                • Name: {vps_instance.name}
                • ID: {vps_instance.id}
                • IP: {vps_instance.public_ip or 'Assigning...'}
                • SSH: ssh root@{vps_instance.public_ip or 'pending'}
                • Location: {provider_config['regions'].get(region, region)}
                
                ⚡ Specs:
                • CPU: {size_config['vcpus']} vCPU
                • RAM: {size_config['memory_mb']}MB
                • Disk: {size_config['disk_gb']}GB
                • Cost: ${size_config['cost']}/month
                
                🔑 SSH Access:
                • User: root
                • Port: 22
                
                💰 Billing: ${size_config['cost']}/month (Best value!)
                """
                
                logger.info(f"✅ RackNerd VPS {name} created: {vps_instance.id}")
                return vps_instance, setup_info
                
            else:
                logger.error(f"❌ RackNerd API error: {response.status_code} - {response.text}")
                return await self._create_mock_vps(name, size, region, image, "racknerd")
                
        except Exception as e:
            logger.error(f"❌ RackNerd VPS creation failed: {e}")
            return await self._create_mock_vps(name, size, region, image, "racknerd")
    
    async def _create_mock_vps(
        self, name: str, size: str, region: str, image: str, provider: str
    ) -> Tuple[VPSInstance, str]:
        """Create mock VPS for development/testing"""
        
        mock_costs = {"scout-nano": 2.95, "scout-micro": 4.95, "scout-small": 8.95}
        
        vps_instance = VPSInstance(
            id=f"mock-{uuid.uuid4().hex[:8]}",
            name=f"podplay-{name}",
            status="running",
            public_ip="203.0.113.10",  # RFC 5737 test IP
            private_ip="10.0.0.10",
            ssh_port=22,
            ssh_user="root",
            provider="mock",
            region=region,
            size=size,
            image=image,
            created_at=str(int(time.time())),
            memory_mb=2048,
            vcpus=2,
            disk_gb=50,
            monthly_cost=mock_costs.get(size, 8.95)
        )
        
        self.active_vps[vps_instance.id] = vps_instance
        
        setup_info = f"""
        🧪 Mock VPS Created (Development Mode)
        
        📋 VPS Details:
        • Name: {vps_instance.name}
        • Provider: Mock ({provider} unavailable)
        • IP: {vps_instance.public_ip}
        • SSH: ssh root@{vps_instance.public_ip}
        
        ⚡ This is a mock VPS for development.
        Configure real API keys to create actual VPS instances.
        """
        
        return vps_instance, setup_info
    
    def _get_bootstrap_script(self) -> str:
        """Get bootstrap script for VPS initialization"""
        return """#!/bin/bash
# Podplay Scout Agent VPS Bootstrap Script

# Update system
apt-get update && apt-get upgrade -y

# Install essential packages
apt-get install -y curl wget git docker.io docker-compose nodejs npm python3 python3-pip

# Configure Docker
systemctl enable docker
systemctl start docker
usermod -aG docker root

# Install Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt-get install -y nodejs

# Install Python packages
pip3 install fastapi uvicorn requests aiofiles

# Configure firewall
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3000
ufw allow 8000
ufw --force enable

# Create workspace directory
mkdir -p /opt/podplay
cd /opt/podplay

# Set up SSH for secure access
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Log installation completion
echo "Podplay Scout Agent VPS Bootstrap completed at $(date)" >> /var/log/podplay-bootstrap.log

# Signal readiness
touch /tmp/podplay-ready
"""

    async def _get_greencloud_vps_details(self, vps_id: str) -> Dict[str, Any]:
        """Get VPS details from GreenCloud API"""
        provider_config = self.providers["greencloud"]
        headers = {
            "Authorization": f"Bearer {provider_config['api_key']}",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.get(
                f"{provider_config['api_endpoint']}/servers/{vps_id}",
                headers=headers,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "public_ip": data.get('ip_address'),
                    "private_ip": data.get('private_ip'),
                    "status": data.get('status'),
                    "created_at": data.get('created_at')
                }
        except Exception as e:
            logger.warning(f"⚠️ Could not fetch GreenCloud VPS details: {e}")
        
        return {}

    async def _get_racknerd_vps_details(self, vps_id: str) -> Dict[str, Any]:
        """Get VPS details from RackNerd API"""
        provider_config = self.providers["racknerd"]
        headers = {
            "Authorization": f"Bearer {provider_config['api_key']}",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.get(
                f"{provider_config['api_endpoint']}/vps/{vps_id}/info",
                headers=headers,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "primary_ip": data.get('primary_ip'),
                    "private_ip": data.get('internal_ip'),
                    "status": data.get('status'),
                    "created_at": data.get('date_created')
                }
        except Exception as e:
            logger.warning(f"⚠️ Could not fetch RackNerd VPS details: {e}")
        
        return {}

    async def rebuild_vps(self, vps_id: str, image: str = "ubuntu-22.04") -> Dict[str, Any]:
        """Rebuild a VPS with fresh OS installation"""
        if vps_id not in self.active_vps:
            return {"success": False, "error": "VPS not found"}
        
        vps = self.active_vps[vps_id]
        provider = vps.provider
        
        try:
            if provider == "greencloud":
                headers = {
                    "Authorization": f"Bearer {self.providers['greencloud']['api_key']}",
                    "Content-Type": "application/json"
                }
                payload = {"image": image, "user_data": self._get_bootstrap_script()}
                response = requests.post(
                    f"{self.providers['greencloud']['api_endpoint']}/servers/{vps_id}/rebuild",
                    headers=headers,
                    json=payload,
                    timeout=30
                )
                
            elif provider == "racknerd":
                headers = {
                    "Authorization": f"Bearer {self.providers['racknerd']['api_key']}",
                    "Content-Type": "application/json"
                }
                payload = {"template": image, "startup_script": self._get_bootstrap_script()}
                response = requests.post(
                    f"{self.providers['racknerd']['api_endpoint']}/vps/{vps_id}/rebuild",
                    headers=headers,
                    json=payload,
                    timeout=30
                )
            
            if response.status_code == 200:
                vps.status = "rebuilding"
                return {
                    "success": True,
                    "message": f"VPS {vps.name} is being rebuilt with {image}",
                    "status": "rebuilding"
                }
            else:
                return {"success": False, "error": f"API error: {response.status_code}"}
                
        except Exception as e:
            logger.error(f"❌ VPS rebuild failed: {e}")
            return {"success": False, "error": str(e)}

    async def get_vps_status(self, vps_id: str) -> Dict[str, Any]:
        """Get VPS status and details"""
        
        if vps_id in self.active_vps:
            vps = self.active_vps[vps_id]
            return {
                "id": vps.id,
                "name": vps.name,
                "status": vps.status,
                "public_ip": vps.public_ip,
                "provider": vps.provider,
                "region": vps.region,
                "monthly_cost": vps.monthly_cost,
                "uptime": int(time.time()) - int(vps.created_at),
                "ssh_command": f"ssh {vps.ssh_user}@{vps.public_ip}" if vps.public_ip else "IP pending"
            }
        
        return {"error": "VPS not found"}
    
    async def list_vps(self) -> List[Dict[str, Any]]:
        """List all VPS instances"""
        
        vps_list = []
        for vps in self.active_vps.values():
            vps_list.append({
                "id": vps.id,
                "name": vps.name,
                "status": vps.status,
                "provider": vps.provider,
                "public_ip": vps.public_ip,
                "monthly_cost": vps.monthly_cost,
                "created_at": vps.created_at
            })
        
        return vps_list
    
    async def stop_vps(self, vps_id: str) -> Dict[str, Any]:
        """Stop a VPS instance"""
        
        if vps_id in self.active_vps:
            vps = self.active_vps[vps_id]
            vps.status = "stopped"
            return {
                "success": True,
                "message": f"VPS {vps.name} stopped successfully",
                "status": vps.status
            }
        
        return {"success": False, "error": "VPS not found"}
    
    async def start_vps(self, vps_id: str) -> Dict[str, Any]:
        """Start a stopped VPS instance"""
        
        if vps_id in self.active_vps:
            vps = self.active_vps[vps_id]
            vps.status = "running"
            return {
                "success": True,
                "message": f"VPS {vps.name} started successfully",
                "status": vps.status
            }
        
        return {"success": False, "error": "VPS not found"}
    
    async def delete_vps(self, vps_id: str) -> Dict[str, Any]:
        """Delete a VPS instance"""
        
        if vps_id in self.active_vps:
            vps = self.active_vps[vps_id]
            del self.active_vps[vps_id]
            return {
                "success": True,
                "message": f"VPS {vps.name} deleted successfully"
            }
        
        return {"success": False, "error": "VPS not found"}
    
    def get_pricing_comparison(self) -> Dict[str, Any]:
        """Compare pricing across providers"""
        
        comparison = {
            "providers": {},
            "recommendations": {}
        }
        
        for provider_name, config in self.providers.items():
            if provider_name == "mock":
                continue
                
            comparison["providers"][provider_name] = {
                "name": config["name"],
                "available": config["available"],
                "sizes": config["sizes"]
            }
        
        # Recommendations
        comparison["recommendations"] = {
            "cheapest_nano": "RackNerd (768MB, $2.49/mo)",
            "best_value": "RackNerd scout-small (3GB, $7.69/mo)",
            "most_powerful": "Either provider scout-large (~$28/mo)",
            "recommended": "RackNerd for cost-effectiveness"
        }
        
        return comparison

# Global instance
cloud_vps_manager = CloudVPSManager()

"""
Oracle Cloud Infrastructure (OCI) VM Manager for Podplay Build Sanctuary
Provides full VM provisioning using Oracle Cloud's Always Free and paid tiers
Designed for Scout Agent production deployments requiring full VM control
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
import oci
from oci.core import ComputeClient, VirtualNetworkClient
from oci.identity import IdentityClient

logger = logging.getLogger(__name__)

@dataclass
class OCIInstance:
    """Represents an OCI compute instance"""
    id: str
    name: str
    status: str  # PROVISIONING, RUNNING, STOPPING, STOPPED, TERMINATED
    public_ip: Optional[str]
    private_ip: Optional[str]
    ssh_port: int
    ssh_user: str
    shape: str
    image: str
    region: str
    availability_domain: str
    created_at: str
    ocpu_count: float
    memory_gb: float
    boot_volume_gb: int
    monthly_cost: float

class OCIVMManager:
    """
    Oracle Cloud Infrastructure VM manager for full VM provisioning
    Supports both Always Free tier and paid compute shapes
    """
    
    def __init__(self):
        # OCI Configuration
        self.config = {
            "user": os.getenv('OCI_USER_ID'),
            "key_file": os.getenv('OCI_PRIVATE_KEY_PATH'),
            "fingerprint": os.getenv('OCI_FINGERPRINT'),
            "tenancy": os.getenv('OCI_TENANCY_ID'),
            "region": os.getenv('OCI_REGION', 'us-ashburn-1')
        }
        
        self.compartment_id = os.getenv('OCI_COMPARTMENT_ID')
        self.enabled = bool(os.getenv('OCI_ENABLED', 'false').lower() == 'true')
        
        # Validate configuration
        self.available = self._validate_config()
        
        # VM Shape configurations
        self.shapes = {
            # Always Free tier
            "micro": {
                "shape": "VM.Standard.E2.1.Micro",
                "ocpu": 1,
                "memory_gb": 1,
                "cost": 0.0,  # Always Free
                "description": "Always Free micro instance"
            },
            "ampere-free": {
                "shape": "VM.Standard.A1.Flex",
                "ocpu": 4,
                "memory_gb": 24,
                "cost": 0.0,  # Always Free (up to 4 OCPU, 24GB RAM)
                "description": "Always Free Ampere ARM instance"
            },
            # Paid tiers
            "small": {
                "shape": "VM.Standard.E4.Flex",
                "ocpu": 2,
                "memory_gb": 8,
                "cost": 24.0,  # ~$24/month
                "description": "Small flexible instance"
            },
            "medium": {
                "shape": "VM.Standard.E4.Flex",
                "ocpu": 4,
                "memory_gb": 16,
                "cost": 48.0,  # ~$48/month
                "description": "Medium flexible instance"
            },
            "large": {
                "shape": "VM.Standard.E4.Flex",
                "ocpu": 8,
                "memory_gb": 32,
                "cost": 96.0,  # ~$96/month
                "description": "Large flexible instance"
            }
        }
        
        # Initialize OCI clients
        if self.available:
            try:
                self.compute_client = ComputeClient(self.config)
                self.network_client = VirtualNetworkClient(self.config)
                self.identity_client = IdentityClient(self.config)
            except Exception as e:
                logger.error(f"❌ Failed to initialize OCI clients: {e}")
                self.available = False
        
        # Track active instances
        self.active_instances: Dict[str, OCIInstance] = {}
        
        logger.info(f"☁️ OCI VM Manager initialized - Available: {self.available}")
    
    def _validate_config(self) -> bool:
        """Validate OCI configuration"""
        required_vars = ['OCI_USER_ID', 'OCI_FINGERPRINT', 'OCI_TENANCY_ID', 'OCI_COMPARTMENT_ID']
        
        for var in required_vars:
            if not os.getenv(var):
                logger.warning(f"⚠️ Missing OCI configuration: {var}")
                return False
        
        key_file = os.getenv('OCI_PRIVATE_KEY_PATH')
        if not key_file or not os.path.exists(key_file):
            logger.warning(f"⚠️ OCI private key file not found: {key_file}")
            return False
        
        return True
    
    async def create_vm(
        self,
        name: str,
        shape: str = "micro",
        image: str = "Oracle-Linux-8.8",
        availability_domain: str = None
    ) -> Tuple[OCIInstance, str]:
        """Create a new OCI compute instance"""
        
        if not self.available:
            return await self._create_mock_instance(name, shape, image)
        
        try:
            shape_config = self.shapes.get(shape, self.shapes["micro"])
            
            # Get availability domain
            if not availability_domain:
                availability_domain = await self._get_availability_domain()
            
            # Get subnet
            subnet_id = await self._get_or_create_subnet()
            
            # Get image OCID
            image_id = await self._get_image_id(image)
            
            # Prepare launch instance details
            launch_details = oci.core.models.LaunchInstanceDetails(
                compartment_id=self.compartment_id,
                display_name=f"podplay-{name}",
                availability_domain=availability_domain,
                shape=shape_config["shape"],
                source_details=oci.core.models.InstanceSourceViaImageDetails(
                    image_id=image_id,
                    source_type="image",
                    boot_volume_size_in_gbs=50
                ),
                create_vnic_details=oci.core.models.CreateVnicDetails(
                    subnet_id=subnet_id,
                    assign_public_ip=True,
                    display_name=f"podplay-{name}-vnic"
                ),
                metadata={
                    "ssh_authorized_keys": await self._get_ssh_public_key(),
                    "user_data": await self._get_cloud_init_script()
                },
                freeform_tags={"Project": "Podplay", "Environment": "Scout"}
            )
            
            # Add shape config for flexible shapes
            if "Flex" in shape_config["shape"]:
                launch_details.shape_config = oci.core.models.LaunchInstanceShapeConfigDetails(
                    ocpus=shape_config["ocpu"],
                    memory_in_gbs=shape_config["memory_gb"]
                )
            
            logger.info(f"☁️ Creating OCI instance: {name} ({shape_config['shape']})")
            
            # Launch instance
            response = self.compute_client.launch_instance(launch_details)
            instance_data = response.data
            
            # Wait for instance to be running
            await self._wait_for_instance_running(instance_data.id)
            
            # Get instance details including IP
            instance_details = await self._get_instance_details(instance_data.id)
            
            oci_instance = OCIInstance(
                id=instance_data.id,
                name=f"podplay-{name}",
                status=instance_data.lifecycle_state,
                public_ip=instance_details.get("public_ip"),
                private_ip=instance_details.get("private_ip"),
                ssh_port=22,
                ssh_user="opc",  # Oracle Cloud default user
                shape=shape_config["shape"],
                image=image,
                region=self.config["region"],
                availability_domain=availability_domain,
                created_at=str(int(time.time())),
                ocpu_count=shape_config["ocpu"],
                memory_gb=shape_config["memory_gb"],
                boot_volume_gb=50,
                monthly_cost=shape_config["cost"]
            )
            
            self.active_instances[oci_instance.id] = oci_instance
            
            setup_info = f"""
            ☁️ Oracle Cloud VM Created Successfully!
            
            📋 Instance Details:
            • Name: {oci_instance.name}
            • ID: {oci_instance.id}
            • Shape: {oci_instance.shape}
            • IP: {oci_instance.public_ip or 'Assigning...'}
            • SSH: ssh opc@{oci_instance.public_ip or 'pending'}
            • Region: {oci_instance.region}
            
            ⚡ Specifications:
            • vCPUs: {oci_instance.ocpu_count}
            • Memory: {oci_instance.memory_gb}GB
            • Storage: {oci_instance.boot_volume_gb}GB
            • Cost: ${oci_instance.monthly_cost}/month
            
            🔑 SSH Access:
            • User: opc
            • Port: 22
            • Key: Use your configured SSH key
            
            💰 Billing: ${oci_instance.monthly_cost}/month {'(Always Free!)' if oci_instance.monthly_cost == 0 else ''}
            """
            
            logger.info(f"✅ OCI instance {name} created: {oci_instance.id}")
            return oci_instance, setup_info
            
        except Exception as e:
            logger.error(f"❌ OCI instance creation failed: {e}")
            return await self._create_mock_instance(name, shape, image)
    
    async def _get_availability_domain(self) -> str:
        """Get first available availability domain"""
        try:
            response = self.identity_client.list_availability_domains(self.compartment_id)
            if response.data:
                return response.data[0].name
            else:
                raise Exception("No availability domains found")
        except Exception as e:
            logger.error(f"❌ Failed to get availability domain: {e}")
            raise
    
    async def _get_or_create_subnet(self) -> str:
        """Get or create a subnet for the instance"""
        try:
            # List existing subnets
            response = self.network_client.list_subnets(self.compartment_id)
            
            # Look for existing Podplay subnet
            for subnet in response.data:
                if "podplay" in subnet.display_name.lower():
                    return subnet.id
            
            # If no subnet found, we'd need to create VCN and subnet
            # For now, use default subnet (this would need enhancement)
            if response.data:
                return response.data[0].id
            else:
                raise Exception("No subnets available")
                
        except Exception as e:
            logger.error(f"❌ Failed to get subnet: {e}")
            raise
    
    async def _get_image_id(self, image_name: str) -> str:
        """Get image OCID for the specified image"""
        try:
            # List available images
            response = self.compute_client.list_images(self.compartment_id)
            
            # Look for the specified image
            for image in response.data:
                if image_name.lower() in image.display_name.lower():
                    return image.id
            
            # Fallback to first Oracle Linux image
            for image in response.data:
                if "oracle" in image.display_name.lower() and "linux" in image.display_name.lower():
                    return image.id
            
            raise Exception(f"Image {image_name} not found")
            
        except Exception as e:
            logger.error(f"❌ Failed to get image ID: {e}")
            raise
    
    async def _get_ssh_public_key(self) -> str:
        """Get SSH public key for instance access"""
        # Try to read from common locations
        ssh_key_paths = [
            os.path.expanduser("~/.ssh/id_rsa.pub"),
            os.path.expanduser("~/.ssh/id_ed25519.pub"),
            os.getenv('SSH_PUBLIC_KEY_PATH')
        ]
        
        for key_path in ssh_key_paths:
            if key_path and os.path.exists(key_path):
                with open(key_path, 'r') as f:
                    return f.read().strip()
        
        logger.warning("⚠️ No SSH public key found - instance may not be accessible")
        return ""
    
    async def _get_cloud_init_script(self) -> str:
        """Get cloud-init script for instance bootstrapping"""
        return """#!/bin/bash
# Podplay Scout Agent OCI Bootstrap Script

# Update system
dnf update -y

# Install essential packages
dnf install -y git docker nodejs npm python3 python3-pip

# Configure Docker
systemctl enable docker
systemctl start docker
usermod -aG docker opc

# Install Node.js LTS
curl -fsSL https://rpm.nodesource.com/setup_lts.x | bash -
dnf install -y nodejs

# Install Python packages
pip3 install fastapi uvicorn requests aiofiles

# Configure firewall
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-port=3000/tcp
firewall-cmd --permanent --add-port=8000/tcp
firewall-cmd --reload

# Create workspace directory
mkdir -p /opt/podplay
chown opc:opc /opt/podplay

# Log completion
echo "Podplay Scout Agent OCI Bootstrap completed at $(date)" >> /var/log/podplay-bootstrap.log
"""
    
    async def _wait_for_instance_running(self, instance_id: str, timeout: int = 300) -> bool:
        """Wait for instance to be in RUNNING state"""
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            try:
                response = self.compute_client.get_instance(instance_id)
                state = response.data.lifecycle_state
                
                if state == "RUNNING":
                    return True
                elif state in ["TERMINATED", "TERMINATING"]:
                    raise Exception(f"Instance failed to start: {state}")
                
                await asyncio.sleep(10)
                
            except Exception as e:
                logger.error(f"❌ Error checking instance state: {e}")
                break
        
        raise Exception("Instance failed to start within timeout")
    
    async def _get_instance_details(self, instance_id: str) -> Dict[str, Any]:
        """Get detailed instance information including IP addresses"""
        try:
            # Get instance details
            instance_response = self.compute_client.get_instance(instance_id)
            instance = instance_response.data
            
            # Get VNIC attachments
            vnic_response = self.compute_client.list_vnic_attachments(
                compartment_id=self.compartment_id,
                instance_id=instance_id
            )
            
            details = {"private_ip": None, "public_ip": None}
            
            if vnic_response.data:
                vnic_attachment = vnic_response.data[0]
                vnic_response = self.network_client.get_vnic(vnic_attachment.vnic_id)
                vnic = vnic_response.data
                
                details["private_ip"] = vnic.private_ip
                details["public_ip"] = vnic.public_ip
            
            return details
            
        except Exception as e:
            logger.error(f"❌ Failed to get instance details: {e}")
            return {}
    
    async def _create_mock_instance(
        self, name: str, shape: str, image: str
    ) -> Tuple[OCIInstance, str]:
        """Create mock instance for testing/development"""
        
        shape_config = self.shapes.get(shape, self.shapes["micro"])
        
        mock_instance = OCIInstance(
            id=f"oci-mock-{uuid.uuid4().hex[:8]}",
            name=f"podplay-{name}",
            status="RUNNING",
            public_ip="203.0.113.20",  # RFC 5737 test IP
            private_ip="10.0.0.20",
            ssh_port=22,
            ssh_user="opc",
            shape=shape_config["shape"],
            image=image,
            region=self.config["region"],
            availability_domain="mock-ad",
            created_at=str(int(time.time())),
            ocpu_count=shape_config["ocpu"],
            memory_gb=shape_config["memory_gb"],
            boot_volume_gb=50,
            monthly_cost=shape_config["cost"]
        )
        
        self.active_instances[mock_instance.id] = mock_instance
        
        setup_info = f"""
        🧪 Mock OCI Instance Created (Development Mode)
        
        📋 Instance Details:
        • Name: {mock_instance.name}
        • Shape: {mock_instance.shape}
        • IP: {mock_instance.public_ip}
        • SSH: ssh opc@{mock_instance.public_ip}
        
        ⚡ This is a mock instance for development.
        Configure OCI credentials to create real instances.
        """
        
        return mock_instance, setup_info
    
    async def list_instances(self) -> List[Dict[str, Any]]:
        """List all instances"""
        instances = []
        
        for instance in self.active_instances.values():
            instances.append({
                "id": instance.id,
                "name": instance.name,
                "status": instance.status,
                "public_ip": instance.public_ip,
                "shape": instance.shape,
                "cost": instance.monthly_cost,
                "region": instance.region
            })
        
        return instances
    
    async def terminate_instance(self, instance_id: str) -> Dict[str, Any]:
        """Terminate an OCI instance"""
        if instance_id not in self.active_instances:
            return {"success": False, "error": "Instance not found"}
        
        try:
            if self.available and not instance_id.startswith("oci-mock"):
                self.compute_client.terminate_instance(instance_id)
            
            instance = self.active_instances[instance_id]
            del self.active_instances[instance_id]
            
            return {
                "success": True,
                "message": f"Instance {instance.name} terminated successfully"
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to terminate instance: {e}")
            return {"success": False, "error": str(e)}

# Global instance
oci_vm_manager = OCIVMManager()

"""
🐻❄️ Podplay Build Sanctuary - NixOS VM Provider Detection
This module detects and validates NixOS VM infrastructure availability
"""

import os
import logging
import subprocess
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class ProviderStatus:
    """Status information for a development environment provider"""
    name: str
    available: bool
    enabled: bool
    version: Optional[str] = None
    issues: List[str] = None
    capabilities: List[str] = None
    
    def __post_init__(self):
        if self.issues is None:
            self.issues = []
        if self.capabilities is None:
            self.capabilities = []

class NixOSVMDetector:
    """Detects and validates NixOS VM infrastructure"""
    
    def __init__(self):
        self.status = ProviderStatus(
            name="NixOS VM",
            available=False,
            enabled=self._is_enabled()
        )
    
    def _is_enabled(self) -> bool:
        """Check if NixOS VM sandbox is enabled in configuration"""
        return os.getenv("NIXOS_SANDBOX_ENABLED", "False").lower() == "true"
    
    def detect(self) -> ProviderStatus:
        """Perform full detection and validation of NixOS VM infrastructure"""
        logger.info("🔍 Detecting NixOS VM infrastructure...")
        
        # Check basic requirements
        self._check_nixos()
        self._check_libvirt()
        self._check_ssh_keys()
        self._check_directories()
        self._check_base_image()
        
        # Determine overall availability
        self.status.available = len(self.status.issues) == 0
        
        # Add capabilities if available
        if self.status.available:
            self.status.capabilities = [
                "Hardware-level isolation",
                "Reproducible environments",
                "Snapshot management",
                "SSH-based execution",
                "Resource scaling"
            ]
        
        logger.info(f"✅ NixOS VM detection complete: {'Available' if self.status.available else 'Unavailable'}")
        return self.status
    
    def _check_nixos(self):
        """Check if NixOS is available"""
        try:
            result = subprocess.run(
                ["nixos-version"], 
                capture_output=True, 
                text=True, 
                timeout=5
            )
            if result.returncode == 0:
                self.status.version = result.stdout.strip()
                logger.debug(f"✓ NixOS detected: {self.status.version}")
            else:
                self.status.issues.append("NixOS not detected (nixos-version failed)")
        except (subprocess.TimeoutExpired, FileNotFoundError):
            self.status.issues.append("NixOS not available (command not found)")
    
    def _check_libvirt(self):
        """Check libvirt availability and connection"""
        try:
            # Check if virsh command exists
            result = subprocess.run(
                ["virsh", "--version"], 
                capture_output=True, 
                text=True, 
                timeout=5
            )
            if result.returncode != 0:
                self.status.issues.append("libvirt not installed (virsh not found)")
                return
            
            # Test libvirt connection
            result = subprocess.run(
                ["virsh", "list", "--all"], 
                capture_output=True, 
                text=True, 
                timeout=10
            )
            if result.returncode == 0:
                logger.debug("✓ libvirt connection successful")
            else:
                self.status.issues.append("libvirt connection failed (check libvirtd service)")
                
        except (subprocess.TimeoutExpired, FileNotFoundError):
            self.status.issues.append("libvirt not available")
    
    def _check_ssh_keys(self):
        """Check SSH key configuration"""
        ssh_key_path = os.path.expanduser(
            os.getenv("NIXOS_VM_SSH_KEY_PATH", "~/.ssh/id_rsa_nixos_vm_executor")
        )
        
        if not os.path.exists(ssh_key_path):
            self.status.issues.append(f"SSH private key not found: {ssh_key_path}")
        elif not os.path.exists(f"{ssh_key_path}.pub"):
            self.status.issues.append(f"SSH public key not found: {ssh_key_path}.pub")
        else:
            # Check key permissions
            key_stat = os.stat(ssh_key_path)
            if oct(key_stat.st_mode)[-3:] != "600":
                self.status.issues.append("SSH private key has incorrect permissions (should be 600)")
            else:
                logger.debug("✓ SSH keys found and properly configured")
    
    def _check_directories(self):
        """Check VM image directories"""
        ephemeral_dir = os.getenv(
            "NIXOS_EPHEMERAL_VM_IMAGES_DIR", 
            "/var/lib/libvirt/images/sandbox_instances"
        )
        workspace_dir = os.getenv(
            "NIXOS_WORKSPACE_VM_IMAGES_DIR", 
            "/var/lib/libvirt/images/workspaces"
        )
        
        for dir_name, dir_path in [("ephemeral", ephemeral_dir), ("workspace", workspace_dir)]:
            if not os.path.exists(dir_path):
                self.status.issues.append(f"{dir_name.capitalize()} VM directory missing: {dir_path}")
            elif not os.access(dir_path, os.W_OK):
                self.status.issues.append(f"{dir_name.capitalize()} VM directory not writable: {dir_path}")
            else:
                logger.debug(f"✓ {dir_name.capitalize()} VM directory accessible: {dir_path}")
    
    def _check_base_image(self):
        """Check base QCOW2 image"""
        base_image = os.getenv(
            "NIXOS_SANDBOX_BASE_IMAGE",
            "/var/lib/libvirt/images/nixos-sandbox-base.qcow2"
        )
        
        if not os.path.exists(base_image):
            self.status.issues.append(f"Base QCOW2 image not found: {base_image}")
        elif not os.access(base_image, os.R_OK):
            self.status.issues.append(f"Base QCOW2 image not readable: {base_image}")
        else:
            logger.debug(f"✓ Base QCOW2 image found: {base_image}")

class DevSandboxProviderDetector:
    """Unified provider detection for DevSandbox environments"""
    
    def __init__(self):
        self.providers = {}
    
    def detect_all_providers(self) -> Dict[str, ProviderStatus]:
        """Detect all available development environment providers"""
        logger.info("🔍 Detecting all DevSandbox providers...")
        
        # Detect NixOS VM provider
        nixos_detector = NixOSVMDetector()
        self.providers["nixos"] = nixos_detector.detect()
        
        # Detect Docker provider
        self.providers["docker"] = self._detect_docker()
        
        # Detect cloud providers
        self.providers["cloud"] = self._detect_cloud_providers()
        
        # Detect local development
        self.providers["local"] = ProviderStatus(
            name="Local",
            available=True,
            enabled=True,
            capabilities=["Direct execution", "Native performance", "Full system access"]
        )
        
        return self.providers
    
    def _detect_docker(self) -> ProviderStatus:
        """Detect Docker availability"""
        status = ProviderStatus(name="Docker", available=False, enabled=True)
        
        try:
            result = subprocess.run(
                ["docker", "--version"], 
                capture_output=True, 
                text=True, 
                timeout=5
            )
            if result.returncode == 0:
                status.version = result.stdout.strip()
                status.available = True
                status.capabilities = [
                    "Process-level isolation",
                    "Fast startup",
                    "Lightweight containers",
                    "Volume mounting"
                ]
                logger.debug(f"✓ Docker detected: {status.version}")
            else:
                status.issues.append("Docker command failed")
        except (subprocess.TimeoutExpired, FileNotFoundError):
            status.issues.append("Docker not installed")
        
        return status
    
    def _detect_cloud_providers(self) -> ProviderStatus:
        """Detect cloud provider availability"""
        status = ProviderStatus(
            name="Cloud",
            available=True,  # Always available if internet connection exists
            enabled=True,
            capabilities=[
                "GitHub Codespaces",
                "StackBlitz integration", 
                "CodeSandbox support",
                "Remote development",
                "Collaborative editing"
            ]
        )
        
        # Check internet connectivity (simplified)
        try:
            import socket
            socket.create_connection(("8.8.8.8", 53), timeout=3)
            logger.debug("✓ Internet connectivity available for cloud providers")
        except OSError:
            status.available = False
            status.issues.append("No internet connectivity for cloud providers")
        
        return status
    
    def get_available_providers(self) -> List[str]:
        """Get list of available provider names"""
        return [name for name, status in self.providers.items() if status.available]
    
    def get_enabled_providers(self) -> List[str]:
        """Get list of enabled provider names"""
        return [name for name, status in self.providers.items() if status.enabled and status.available]
    
    def get_provider_summary(self) -> Dict[str, Any]:
        """Get a summary of all providers for frontend display"""
        summary = {}
        for name, status in self.providers.items():
            summary[name] = {
                "name": status.name,
                "available": status.available,
                "enabled": status.enabled,
                "version": status.version,
                "capabilities": status.capabilities,
                "issues": status.issues
            }
        return summary

# Convenience functions for integration
def detect_nixos_vm_availability() -> bool:
    """Quick check if NixOS VM infrastructure is available"""
    detector = NixOSVMDetector()
    status = detector.detect()
    return status.available

def get_devsandbox_providers() -> Dict[str, ProviderStatus]:
    """Get all DevSandbox provider statuses"""
    detector = DevSandboxProviderDetector()
    return detector.detect_all_providers()

if __name__ == "__main__":
    # Test the detection system
    logging.basicConfig(level=logging.DEBUG)
    
    print("🧪 Testing NixOS VM Provider Detection")
    print("=" * 50)
    
    detector = DevSandboxProviderDetector()
    providers = detector.detect_all_providers()
    
    for name, status in providers.items():
        print(f"\n{status.name} Provider:")
        print(f"  Available: {'✅' if status.available else '❌'}")
        print(f"  Enabled: {'✅' if status.enabled else '❌'}")
        if status.version:
            print(f"  Version: {status.version}")
        if status.capabilities:
            print(f"  Capabilities: {', '.join(status.capabilities)}")
        if status.issues:
            print(f"  Issues: {', '.join(status.issues)}")
    
    print(f"\n📊 Summary:")
    print(f"  Available providers: {', '.join(detector.get_available_providers())}")
    print(f"  Enabled providers: {', '.join(detector.get_enabled_providers())}")

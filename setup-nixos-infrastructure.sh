#!/bin/bash
# 🐻❄️ Podplay Build Sanctuary - NixOS VM Infrastructure Setup
# This script sets up the necessary infrastructure for NixOS VM-based sandboxes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

# Load environment variables if .env exists
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
fi

# Default values (can be overridden by .env)
NIXOS_SANDBOX_BASE_IMAGE="${NIXOS_SANDBOX_BASE_IMAGE:-/var/lib/libvirt/images/nixos-sandbox-base.qcow2}"
NIXOS_EPHEMERAL_VM_IMAGES_DIR="${NIXOS_EPHEMERAL_VM_IMAGES_DIR:-/var/lib/libvirt/images/sandbox_instances}"
NIXOS_WORKSPACE_VM_IMAGES_DIR="${NIXOS_WORKSPACE_VM_IMAGES_DIR:-/var/lib/libvirt/images/workspaces}"
NIXOS_VM_SSH_KEY_PATH="${NIXOS_VM_SSH_KEY_PATH:-~/.ssh/id_rsa_nixos_vm_executor}"
NIXOS_VM_SSH_USER="${NIXOS_VM_SSH_USER:-executor}"

echo -e "${BLUE}🐻❄️ Podplay Build Sanctuary - NixOS Infrastructure Setup${NC}"
echo "=========================================================="

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if running as root (needed for libvirt setup)
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_warning "Running as root. Some steps will be performed system-wide."
    else
        print_info "Running as regular user. Some steps may require sudo."
    fi
}

# Check if NixOS is available
check_nixos() {
    print_info "Checking NixOS availability..."
    
    if command -v nixos-version &> /dev/null; then
        NIXOS_VERSION=$(nixos-version)
        print_status "NixOS detected: $NIXOS_VERSION"
        return 0
    else
        print_error "NixOS not detected. This setup requires NixOS for VM base images."
        print_info "You can still use Docker containers or cloud providers."
        return 1
    fi
}

# Check and install libvirt
setup_libvirt() {
    print_info "Setting up libvirt virtualization..."
    
    if command -v virsh &> /dev/null; then
        print_status "libvirt already installed"
    else
        print_info "Installing libvirt..."
        if command -v nix-env &> /dev/null; then
            nix-env -iA nixpkgs.libvirt nixpkgs.qemu nixpkgs.virt-manager
        elif command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y libvirt-daemon-system libvirt-clients qemu-kvm virt-manager
        elif command -v yum &> /dev/null; then
            sudo yum install -y libvirt qemu-kvm virt-manager
        else
            print_error "Could not detect package manager. Please install libvirt manually."
            return 1
        fi
    fi
    
    # Start libvirt daemon
    if systemctl is-active --quiet libvirtd; then
        print_status "libvirtd service is running"
    else
        print_info "Starting libvirtd service..."
        sudo systemctl start libvirtd
        sudo systemctl enable libvirtd
    fi
    
    # Add user to libvirt group
    if groups $USER | grep -q libvirt; then
        print_status "User already in libvirt group"
    else
        print_info "Adding user to libvirt group..."
        sudo usermod -a -G libvirt $USER
        print_warning "Please log out and log back in for group changes to take effect"
    fi
}

# Create VM image directories
create_directories() {
    print_info "Creating VM image directories..."
    
    for dir in "$NIXOS_EPHEMERAL_VM_IMAGES_DIR" "$NIXOS_WORKSPACE_VM_IMAGES_DIR"; do
        if [ ! -d "$dir" ]; then
            print_info "Creating directory: $dir"
            sudo mkdir -p "$dir"
            sudo chown root:libvirt "$dir"
            sudo chmod 775 "$dir"
            print_status "Created $dir"
        else
            print_status "Directory exists: $dir"
        fi
    done
}

# Generate SSH keys for VM access
setup_ssh_keys() {
    print_info "Setting up SSH keys for VM access..."
    
    SSH_KEY_PATH=$(eval echo "$NIXOS_VM_SSH_KEY_PATH")
    
    if [ -f "$SSH_KEY_PATH" ]; then
        print_status "SSH key already exists: $SSH_KEY_PATH"
    else
        print_info "Generating SSH key pair..."
        ssh-keygen -t rsa -b 4096 -f "$SSH_KEY_PATH" -N "" -C "nixos-vm-executor"
        chmod 600 "$SSH_KEY_PATH"
        chmod 644 "$SSH_KEY_PATH.pub"
        print_status "Generated SSH key: $SSH_KEY_PATH"
    fi
    
    print_info "SSH public key for VM configuration:"
    echo "$(cat $SSH_KEY_PATH.pub)"
}

# Check for base image
check_base_image() {
    print_info "Checking for NixOS base image..."
    
    if [ -f "$NIXOS_SANDBOX_BASE_IMAGE" ]; then
        print_status "Base image exists: $NIXOS_SANDBOX_BASE_IMAGE"
    else
        print_warning "Base image not found: $NIXOS_SANDBOX_BASE_IMAGE"
        print_info "You'll need to create a NixOS QCOW2 base image with:"
        print_info "  - SSH server enabled"
        print_info "  - User '$NIXOS_VM_SSH_USER' with sudo privileges"
        print_info "  - Python runtime and development tools"
        print_info "  - The SSH public key in /home/$NIXOS_VM_SSH_USER/.ssh/authorized_keys"
    fi
}

# Test libvirt connection
test_libvirt() {
    print_info "Testing libvirt connection..."
    
    if virsh list --all &> /dev/null; then
        print_status "libvirt connection successful"
        VM_COUNT=$(virsh list --all | wc -l)
        print_info "Found $((VM_COUNT - 2)) VMs in libvirt"
    else
        print_error "Failed to connect to libvirt"
        print_info "Try running: sudo systemctl restart libvirtd"
        return 1
    fi
}

# Create a simple test script
create_test_script() {
    print_info "Creating NixOS VM test script..."
    
    cat > "$SCRIPT_DIR/test-nixos-vm.py" << 'EOF'
#!/usr/bin/env python3
"""
Test script for NixOS VM infrastructure
"""
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), 'Podplay-Sanctuary-nixos-sandbox-dev', 'backend'))

def test_nixos_infrastructure():
    print("🧪 Testing NixOS VM Infrastructure...")
    
    try:
        from vm_manager import LibvirtManager
        print("✓ VM Manager import successful")
        
        vm_manager = LibvirtManager()
        print("✓ LibVirt connection successful")
        
        # Test SSH key existence
        ssh_key_path = os.path.expanduser(os.getenv("NIXOS_VM_SSH_KEY_PATH", "~/.ssh/id_rsa_nixos_vm_executor"))
        if os.path.exists(ssh_key_path):
            print("✓ SSH key found")
        else:
            print("✗ SSH key not found")
        
        # Test directories
        ephemeral_dir = os.getenv("NIXOS_EPHEMERAL_VM_IMAGES_DIR", "/var/lib/libvirt/images/sandbox_instances")
        workspace_dir = os.getenv("NIXOS_WORKSPACE_VM_IMAGES_DIR", "/var/lib/libvirt/images/workspaces")
        
        if os.path.exists(ephemeral_dir):
            print("✓ Ephemeral VM directory exists")
        else:
            print("✗ Ephemeral VM directory missing")
            
        if os.path.exists(workspace_dir):
            print("✓ Workspace VM directory exists")
        else:
            print("✗ Workspace VM directory missing")
        
        print("🎉 NixOS infrastructure test completed!")
        
    except ImportError as e:
        print(f"✗ Import error: {e}")
        print("Make sure you're running from the main project directory")
    except Exception as e:
        print(f"✗ Test failed: {e}")

if __name__ == "__main__":
    test_nixos_infrastructure()
EOF
    
    chmod +x "$SCRIPT_DIR/test-nixos-vm.py"
    print_status "Created test script: test-nixos-vm.py"
}

# Main setup function
main() {
    echo
    print_info "Starting NixOS VM infrastructure setup..."
    echo
    
    check_root
    
    if check_nixos; then
        setup_libvirt
        create_directories
        setup_ssh_keys
        check_base_image
        test_libvirt
        create_test_script
        
        echo
        print_status "🎉 NixOS VM infrastructure setup completed!"
        echo
        print_info "Next steps:"
        print_info "1. Create a NixOS base QCOW2 image if not already present"
        print_info "2. Set NIXOS_SANDBOX_ENABLED=True in your .env file"
        print_info "3. Run ./test-nixos-vm.py to verify the setup"
        print_info "4. Start the Podplay Build Sanctuary with NixOS support"
        echo
        print_warning "Note: If you added your user to the libvirt group, you may need to log out and back in."
    else
        print_info "NixOS not available. Docker containers and cloud providers will remain available."
    fi
}

# Run main function
main "$@"

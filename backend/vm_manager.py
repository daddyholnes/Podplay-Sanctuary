import os
import uuid
import logging
import time
import subprocess
from typing import Dict, List, Optional, Any, Tuple # Added for type hints
from xml.etree import ElementTree # For parsing XML metadata

# Conditional libvirt import
try:
    import libvirt
    LIBVIRT_AVAILABLE = True
    # Type aliases for type hints
    DomainType = libvirt.virDomain
except ImportError:
    LIBVIRT_AVAILABLE = False
    # Mock libvirt module with constants when not available
    class MockLibvirt:
        VIR_ERR_NO_DOMAIN = 42
        VIR_DOMAIN_SHUTDOWN_ACPI_POWER_BTN = 1
        VIR_ERR_OPERATION_INVALID = 55
        VIR_DOMAIN_SHUTOFF = 5
        VIR_DOMAIN_UNDEFINE_MANAGED_SAVE = 1
        VIR_DOMAIN_INTERFACE_ADDRESSES_SRC_AGENT = 0
        VIR_IP_ADDR_TYPE_IPV4 = 0
        VIR_ERR_AGENT_UNRESPONSIVE = 86
        VIR_ERR_QEMU_AGENT_COMMAND_FAILED = 87
        
        # Mock virDomain class for type hints
        class virDomain:
            pass
    
    libvirt = MockLibvirt()
    # Type alias for when libvirt is not available
    DomainType = Any

logger = logging.getLogger(__name__)

# Configuration (Ideally from app config or .env)
# Use local directories instead of system directories to avoid permission issues
LOCAL_VM_DIR = os.path.join(os.path.dirname(__file__), "nixos_vms")
BASE_QCOW2_IMAGE_PATH = os.getenv("NIXOS_SANDBOX_BASE_IMAGE", os.path.join(LOCAL_VM_DIR, "nixos-sandbox-base.qcow2"))
# Directory for ephemeral sandbox instances
EPHEMERAL_VM_IMAGES_DIR = os.getenv("NIXOS_EPHEMERAL_VM_IMAGES_DIR", os.path.join(LOCAL_VM_DIR, "sandbox_instances"))
# Directory for persistent workspace VMs
WORKSPACE_VM_IMAGES_DIR = os.getenv("NIXOS_WORKSPACE_VM_IMAGES_DIR", os.path.join(LOCAL_VM_DIR, "workspaces"))

DEFAULT_VM_MEMORY_MB = int(os.getenv("NIXOS_VM_DEFAULT_MEMORY_MB", "512")) # MB for ephemeral
DEFAULT_VM_VCPUS = int(os.getenv("NIXOS_VM_DEFAULT_VCPUS", "1")) # for ephemeral
DEFAULT_WORKSPACE_MEMORY_MB = int(os.getenv("NIXOS_WORKSPACE_DEFAULT_MEMORY_MB", "1024")) 
DEFAULT_WORKSPACE_VCPUS = int(os.getenv("NIXOS_WORKSPACE_DEFAULT_VCPUS", "2"))
# DEFAULT_WORKSPACE_DISK_SIZE is for creating new, independent disks, not used for overlays on base in this version.

# Ensure VM images directories exist
os.makedirs(EPHEMERAL_VM_IMAGES_DIR, exist_ok=True)
os.makedirs(WORKSPACE_VM_IMAGES_DIR, exist_ok=True)

class VMManagerError(Exception):
    pass

class LibvirtManager:
    def __init__(self, connection_uri="qemu:///system"):
        self.conn = None
        self.mock_mode = False
        
        if not LIBVIRT_AVAILABLE:
            logger.warning("Libvirt is not available. Running in mock mode for development.")
            self.mock_mode = True
            return
        
        try:
            self.conn = libvirt.open(connection_uri)
            if self.conn is None:
                error_msg = "Failed to open connection to libvirt: Connection returned None"
                logger.error(error_msg)
                raise VMManagerError(error_msg)
            logger.info("Successfully connected to libvirt")
            
        except libvirt.libvirtError as e:
            error_msg = f"Libvirt connection error (permission or service issue): {str(e)}. " \
                      f"Please ensure the libvirt daemon is running and your user has proper permissions. " \
                      f"You may need to add your user to the 'libvirt' group and restart the service."
            logger.warning(error_msg)
            logger.warning("Falling back to mock mode for development.")
            self.mock_mode = True
        except Exception as e:
            error_msg = f"Unexpected error connecting to libvirt: {str(e)}"
            logger.error(error_msg, exc_info=True)
            logger.warning("Falling back to mock mode for development.")
            self.mock_mode = True

    def _create_qcow2_image(self, image_name: str, base_image_path: Optional[str] = None, size: Optional[str] = None, target_dir: str = EPHEMERAL_VM_IMAGES_DIR) -> str:
        """
        Creates a QCOW2 image.
        If base_image_path is provided, it creates an overlay (linked clone).
        If size is provided and base_image_path is None, it creates a new standalone qcow2 image.
        """
        if base_image_path and not os.path.exists(base_image_path):
            raise VMManagerError(f"Base QCOW2 image not found at {base_image_path}")
        
        image_path = os.path.join(target_dir, f"{image_name}.qcow2")
        
        cmd = ["qemu-img", "create", "-f", "qcow2"]
        if base_image_path:
            cmd.extend(["-o", f"backing_file={base_image_path}", image_path])
            if size:
                 logger.warning(f"Size parameter '{size}' provided for overlay image '{image_name}' is usually ignored by qemu-img during creation with a backing file. Overlay will use backing file's virtual size.")
        elif size:
            cmd.extend([image_path, size])
        else:
            # If it's an overlay, size is not strictly needed. If it's not an overlay, size is needed.
            # This logic implies if base_image_path is None, size MUST be specified.
            if not base_image_path and not size: # Added this condition
                 raise VMManagerError("Size must be specified for a new non-overlay disk.")

        try:
            subprocess.run(cmd, check=True, capture_output=True)
            logger.info(f"Created QCOW2 image: {image_path} (Backed by: {base_image_path if base_image_path else 'None, Size: ' + str(size)})")
            return image_path
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to create image {image_path}: {e.stderr.decode()}")
            raise VMManagerError(f"Failed to create image: {e.stderr.decode()}")
        except FileNotFoundError:
            logger.error("qemu-img command not found. Please ensure QEMU utilities are installed.")
            raise VMManagerError("qemu-img command not found.")

    def _generic_define_vm(self, vm_id: str, disk_path: str, memory_mb: int, vcpus: int, enable_network: bool = False, domain_type: str = "ephemeral") -> DomainType:
        """Generic VM definition logic. Domain type for logging/metadata if needed."""
        network_config = ""
        if enable_network:
            mac_bytes = os.urandom(3) 
            mac_suffix = "".join([f"{b:02x}" for b in mac_bytes])
            network_config = f"""
            <interface type='network'>
              <mac address='52:54:00:{mac_suffix[:2]}:{mac_suffix[2:4]}:{mac_suffix[4:6]}'/>
              <source network='default'/> 
              <model type='virtio'/>
              <address type='pci' domain='0x0000' bus='0x01' slot='0x00' function='0x0'/>
            </interface>
            """
        
        xml_config = f"""
        <domain type='kvm'>
          <name>{vm_id}</name>
          <uuid>{str(uuid.uuid4())}</uuid>
          <metadata>
            <app:metadata xmlns:app="http://example.com/libvirt/metadata/app">
                <app:type>{domain_type}</app:type>
                <app:disk_path>{disk_path}</app:disk_path>
            </app:metadata>
          </metadata>
          <memory unit='MiB'>{memory_mb}</memory>
          <currentMemory unit='MiB'>{memory_mb}</currentMemory>
          <vcpu placement='static'>{vcpus}</vcpu>
          <os>
            <type arch='x86_64' machine='pc-q35-8.0'>hvm</type>
          </os>
          <features><acpi/><apic/><vmport state='off'/></features>
          <cpu mode='host-model'><model fallback='allow'/></cpu>
          <clock offset='utc'>
            <timer name='rtc' tickpolicy='catchup'/>
            <timer name='pit' tickpolicy='delay'/>
            <timer name='hpet' present='no'/>
          </clock>
          <on_poweroff>destroy</on_poweroff>
          <on_reboot>restart</on_reboot>
          <on_crash>destroy</on_crash>
          <pm><suspend-to-mem enabled='no'/><suspend-to-disk enabled='no'/></pm>
          <devices>
            <emulator>/usr/bin/qemu-system-x86_64</emulator>
            <disk type='file' device='disk'>
              <driver name='qemu' type='qcow2'/>
              <source file='{disk_path}'/>
              <target dev='vda' bus='virtio'/>
              <address type='pci' domain='0x0000' bus='0x04' slot='0x00' function='0x0'/>
            </disk>
            <controller type='usb' index='0' model='qemu-xhci' ports='15'>
              <address type='pci' domain='0x0000' bus='0x02' slot='0x00' function='0x0'/>
            </controller>
            <controller type='pci' index='0' model='pcie-root'/>
            {network_config}
            <serial type='pty'>
              <target type='isa-serial' port='0'><model name='isa-serial'/></target>
            </serial>
            <console type='pty'><target type='serial' port='0'/></console>
            <channel type='unix'>
              <target type='virtio' name='org.qemu.guest_agent.0'/>
              <address type='virtio-serial' controller='0' bus='0' port='1'/>
            </channel>
            <input type='tablet' bus='usb'><address type='usb' bus='0' port='1'/></input>
            <input type='mouse' bus='ps2'/>
            <input type='keyboard' bus='ps2'/>
            <graphics type='spice' autoport='yes'><listen type='address'/><image compression='off'/></graphics>
            <video><model type='virtio' heads='1' primary='yes'/>
              <address type='pci' domain='0x0000' bus='0x00' slot='0x01' function='0x0'/>
            </video>
            <memballoon model='virtio'>
              <address type='pci' domain='0x0000' bus='0x03' slot='0x00' function='0x0'/>
            </memballoon>
            <rng model='virtio'>
              <backend model='random'>/dev/urandom</backend>
              <address type='pci' domain='0x0000' bus='0x05' slot='0x00' function='0x0'/>
            </rng>
          </devices>
        </domain>
        """
        try:
            domain = self.conn.defineXML(xml_config)
            logger.info(f"Defined VM: {vm_id} (Type: {domain_type}) with disk {disk_path}")
            return domain
        except libvirt.libvirtError as e:
            logger.error(f"Failed to define VM {vm_id}: {e}")
            if os.path.exists(disk_path): 
                try:
                    os.remove(disk_path)
                    logger.info(f"Cleaned up disk {disk_path} after VM definition failure.")
                except OSError as rm_e:
                    logger.error(f"Failed to remove disk {disk_path} after definition error: {rm_e}")
            raise VMManagerError(f"Failed to define VM {vm_id}: {e}")

    def define_ephemeral_vm(self, vm_id: str, memory_mb: int = DEFAULT_VM_MEMORY_MB, vcpus: int = DEFAULT_VM_VCPUS) -> tuple[DomainType, str]:
        """Defines a new ephemeral VM domain using an overlay image (no network by default)."""
        overlay_image_path = self._create_qcow2_image(vm_id, base_image_path=BASE_QCOW2_IMAGE_PATH, target_dir=EPHEMERAL_VM_IMAGES_DIR)
        domain = self._generic_define_vm(vm_id, overlay_image_path, memory_mb, vcpus, enable_network=False, domain_type="ephemeral")
        return domain, overlay_image_path

    def define_workspace_vm(self, workspace_id: str, memory_mb: int = DEFAULT_WORKSPACE_MEMORY_MB, vcpus: int = DEFAULT_WORKSPACE_VCPUS) -> tuple[DomainType, str]:
        """Defines a new persistent workspace VM, using an overlay image stored in the workspace directory."""
        workspace_disk_path = self._create_qcow2_image(
            workspace_id, 
            base_image_path=BASE_QCOW2_IMAGE_PATH, 
            target_dir=WORKSPACE_VM_IMAGES_DIR
        )
        domain = self._generic_define_vm(workspace_id, workspace_disk_path, memory_mb, vcpus, enable_network=True, domain_type="workspace")
        return domain, workspace_disk_path

    def _get_domain_object(self, domain_or_name: str | DomainType) -> DomainType:
        """Helper to get a domain object if a name is passed."""
        if isinstance(domain_or_name, str):
            try:
                return self.conn.lookupByName(domain_or_name)
            except libvirt.libvirtError as e:
                if e.get_error_code() == libvirt.VIR_ERR_NO_DOMAIN:
                    raise VMManagerError(f"VM with name '{domain_or_name}' not found.")
                raise VMManagerError(f"Error looking up VM '{domain_or_name}': {e}")
        return domain_or_name

    def start_vm(self, domain_or_name: str | DomainType):
        """Starts a defined VM by name or domain object."""
        domain = self._get_domain_object(domain_or_name)
        try:
            if not domain.isActive():
                domain.create() 
                logger.info(f"VM {domain.name()} started.")
            else:
                logger.info(f"VM {domain.name()} is already running.")
        except libvirt.libvirtError as e:
            logger.error(f"Failed to start VM {domain.name()}: {e}")
            raise VMManagerError(f"Failed to start VM {domain.name()}: {e}")

    def stop_vm(self, domain_or_name: str | DomainType, force: bool = False, for_workspace: bool = False):
        """
        Stops a running VM.
        If `for_workspace` is True, it attempts a graceful shutdown (ACPI). Otherwise, or if `force` is True, it destroys.
        """
        domain = self._get_domain_object(domain_or_name)
        vm_name = domain.name() 
        try:
            if domain.isActive():
                if force or not for_workspace: 
                    domain.destroy() 
                    logger.info(f"VM {vm_name} forcefully destroyed.")
                else: 
                    domain.shutdownFlags(libvirt.VIR_DOMAIN_SHUTDOWN_ACPI_POWER_BTN)
                    logger.info(f"VM {vm_name} ACPI shutdown initiated.")
                    for _ in range(30): # Wait up to 30s
                        if not domain.isActive(): break
                        time.sleep(1)
                    if domain.isActive():
                        logger.warning(f"VM {vm_name} did not gracefully shutdown via ACPI. Forcing destroy.")
                        domain.destroy()
                        logger.info(f"VM {vm_name} forcefully destroyed after failed graceful shutdown.")
            else:
                logger.info(f"VM {vm_name} is already stopped.")
        except libvirt.libvirtError as e:
            # Check if error is because domain is already shut off, which is not a failure in 'stop' context
            if not (e.get_error_code() == libvirt.VIR_ERR_OPERATION_INVALID and domain.state()[0] == libvirt.VIR_DOMAIN_SHUTOFF):
                logger.error(f"Failed to stop VM {vm_name}: {e}")
                raise VMManagerError(f"Failed to stop VM {vm_name}: {e}")
            logger.warning(f"VM {vm_name} was already not running or in a state preventing normal stop: {e}")


    def undefine_vm(self, domain_or_name: str | DomainType):
        """Undefines a VM (usually after it's stopped)."""
        domain = self._get_domain_object(domain_or_name)
        vm_name = domain.name()
        try:
            # Remove any managed save state to prevent errors during undefine
            domain.undefineFlags(libvirt.VIR_DOMAIN_UNDEFINE_MANAGED_SAVE)
            logger.info(f"VM {vm_name} undefined (with managed save state removal).")
        except libvirt.libvirtError as e:
            logger.error(f"Failed to undefine VM {vm_name}: {e}")
            raise VMManagerError(f"Failed to undefine VM {vm_name}: {e}")
            
    def cleanup_ephemeral_vm_resources(self, domain: DomainType, overlay_image_path: str):
        """Stops, undefines an ephemeral VM, and removes its overlay image."""
        vm_name = "unknown_vm" # Initialize in case domain.name() fails
        try:
            vm_name = domain.name() 
            if domain.isActive():
                self.stop_vm(domain, force=True, for_workspace=False) 
            self.undefine_vm(domain)
        except libvirt.libvirtError as e: # Catch libvirt specific errors
            logger.warning(f"Libvirt error during cleanup for ephemeral VM {vm_name} (might be already gone or in error state): {e}")
        except VMManagerError as e: # Catch our custom errors from stop_vm/undefine_vm
             logger.warning(f"VMManagerError during cleanup for ephemeral VM {vm_name}: {e}")
        except Exception as e: 
             logger.error(f"Unexpected error during libvirt cleanup for ephemeral VM {vm_name}: {e}", exc_info=True)

        # Disk cleanup
        if overlay_image_path and os.path.exists(overlay_image_path):
            # Security check: ensure we are deleting from the ephemeral directory
            if EPHEMERAL_VM_IMAGES_DIR not in os.path.abspath(overlay_image_path):
                logger.error(f"Security Alert: Attempt to delete disk {overlay_image_path} outside of ephemeral VM directory {EPHEMERAL_VM_IMAGES_DIR}.")
                return # Do not delete
            try:
                os.remove(overlay_image_path)
                logger.info(f"Removed ephemeral overlay image: {overlay_image_path}")
            except OSError as e:
                logger.error(f"Failed to remove ephemeral overlay image {overlay_image_path}: {e}")

    def delete_workspace_vm(self, workspace_id: str):
        """Stops, undefines, and deletes the disk for a persistent workspace VM."""
        logger.info(f"Attempting to delete workspace VM: {workspace_id}")
        domain = None
        try:
            domain = self.conn.lookupByName(workspace_id)
        except libvirt.libvirtError as e:
            if e.get_error_code() == libvirt.VIR_ERR_NO_DOMAIN:
                logger.warning(f"Workspace VM {workspace_id} not found in libvirt (already undefined?). Checking for disk.")
            else: 
                logger.error(f"Error looking up workspace VM {workspace_id} for deletion: {e}")
                raise VMManagerError(f"Error looking up workspace VM {workspace_id}: {e}")

        # Determine disk path
        # Default convention first
        workspace_disk_path = os.path.join(WORKSPACE_VM_IMAGES_DIR, f"{workspace_id}.qcow2")
        if domain: # If domain exists, try to get disk path from its metadata
            try:
                xml_desc = domain.XMLDesc(0)
                root = ElementTree.fromstring(xml_desc)
                meta_disk_path_element = root.find(".//app:disk_path", namespaces={'app': 'http://example.com/libvirt/metadata/app'})
                if meta_disk_path_element is not None and meta_disk_path_element.text:
                    # Security check: ensure the path from metadata is within the expected directory
                    if WORKSPACE_VM_IMAGES_DIR in os.path.abspath(meta_disk_path_element.text):
                        workspace_disk_path = meta_disk_path_element.text
                        logger.info(f"Using disk path from VM metadata for {workspace_id}: {workspace_disk_path}")
                    else:
                        logger.warning(f"Disk path from metadata for {workspace_id} ('{meta_disk_path_element.text}') is outside WORKSPACE_VM_IMAGES_DIR. Using convention path instead.")
            except Exception as xml_e:
                logger.warning(f"Could not parse metadata for disk path for {workspace_id}, using convention. Error: {xml_e}")
        
        if domain: 
            try:
                if domain.isActive():
                    self.stop_vm(domain, force=True, for_workspace=True) 
                self.undefine_vm(domain)
            except (libvirt.libvirtError, VMManagerError) as e: 
                logger.warning(f"Error during libvirt stop/undefine for workspace {workspace_id} (will proceed to disk deletion): {e}")
            except Exception as e_stop_undef:
                 logger.error(f"Unexpected error during libvirt stop/undefine for workspace {workspace_id}: {e_stop_undef}", exc_info=True)

        if os.path.exists(workspace_disk_path):
            if WORKSPACE_VM_IMAGES_DIR not in os.path.abspath(workspace_disk_path): 
                logger.error(f"Refusing to delete disk {workspace_disk_path} as it is outside the designated workspace directory.")
                raise VMManagerError(f"Disk path {workspace_disk_path} is outside the allowed workspace directory.")
            try:
                os.remove(workspace_disk_path)
                logger.info(f"Removed workspace disk: {workspace_disk_path}")
            except OSError as e:
                logger.error(f"Failed to remove workspace disk {workspace_disk_path}: {e}")
                raise VMManagerError(f"Failed to remove disk for workspace {workspace_id}: {e}")
        else:
            logger.warning(f"Workspace disk {workspace_disk_path} not found during delete for {workspace_id}.")


    def get_vm_ip_address(self, domain_or_name: str | DomainType, timeout_seconds=120, use_arp_fallback=False) -> str | None:
        """
        Retrieves the IP address of the VM.
        Primary method: qemu-guest-agent.
        Fallback (if use_arp_fallback=True and agent fails): Parse libvirt's DHCP leases for 'default' network.
        """
        domain = self._get_domain_object(domain_or_name)
        vm_name = domain.name()
        start_time = time.time()

        logger.debug(f"Attempting to get IP for {vm_name} via QEMU Guest Agent...")
        while time.time() - start_time < timeout_seconds:
            try:
                if not domain.isActive():
                    logger.warning(f"VM {vm_name} is not active, cannot get IP via guest agent.")
                    return None 
                
                ifaces = domain.interfaceAddresses(libvirt.VIR_DOMAIN_INTERFACE_ADDRESSES_SRC_AGENT, 0)
                if ifaces: 
                    for (_name, val) in ifaces.items():
                        if val.get('addrs'):
                            for addr in val['addrs']:
                                if addr.get('type') == libvirt.VIR_IP_ADDR_TYPE_IPV4 and \
                                   addr.get('addr') and \
                                   not addr['addr'].startswith("127.") and \
                                   not addr['addr'].startswith("169.254."):
                                    logger.info(f"VM {vm_name} IP (Guest Agent): {addr['addr']}")
                                    return addr['addr']
            except libvirt.libvirtError as e:
                err_code = e.get_error_code()
                if err_code == libvirt.VIR_ERR_AGENT_UNRESPONSIVE or err_code == libvirt.VIR_ERR_QEMU_AGENT_COMMAND_FAILED:
                    logger.debug(f"QEMU Guest Agent for {vm_name} is not responsive or command failed (will retry or use fallback if enabled). Error: {e}")
                elif err_code == libvirt.VIR_ERR_OPERATION_INVALID and "interfaceAddresses with agent" in str(e):
                    logger.debug(f"Guest agent call not supported or agent not running for {vm_name} (will retry or use fallback). Error: {e}")
                else: 
                    logger.warning(f"Error getting IP for {vm_name} via Guest Agent (will retry or use fallback): {e}")
            except Exception as e_agent: 
                logger.error(f"Unexpected error getting IP for {vm_name} via Guest Agent: {e_agent}", exc_info=True)
            
            if use_arp_fallback and (time.time() - start_time > timeout_seconds / 2):
                logger.debug(f"Guest agent method partway timeout for {vm_name}, proceeding to ARP/DHCP lease fallback.")
                break 
            if not domain.isActive(): 
                 logger.warning(f"VM {vm_name} became inactive while polling for IP.")
                 return None
            time.sleep(3) 
        
        if use_arp_fallback:
            logger.info(f"Guest agent method failed or timed out for {vm_name}. Trying MAC/DHCP lease method...")
            try:
                xml_desc = domain.XMLDesc(0)
                root = ElementTree.fromstring(xml_desc)
                for iface_element in root.findall(".//interface[@type='network']/mac"):
                    mac_address = iface_element.get("address")
                    if mac_address:
                        logger.debug(f"VM {vm_name} has MAC {mac_address}. Querying DHCP leases for 'default' network.")
                        try:
                            default_net = self.conn.networkLookupByName('default')
                            if default_net and default_net.isActive():
                                leases = default_net.DHCPLeases() 
                                for lease in leases:
                                    if lease.get('mac','').lower() == mac_address.lower() and lease.get('type') == libvirt.VIR_IP_ADDR_TYPE_IPV4 and lease.get('ipaddr'):
                                        logger.info(f"VM {vm_name} IP (DHCP Lease for MAC {mac_address}): {lease['ipaddr']}")
                                        return lease['ipaddr']
                                logger.debug(f"No matching DHCP lease found for MAC {mac_address} in 'default' network.")
                            else:
                                logger.warning("Libvirt 'default' network not active or not found, cannot get DHCP leases.")
                        except libvirt.libvirtError as e_lease:
                            logger.warning(f"Could not get DHCP leases for network 'default': {e_lease}")
                        except Exception as e_lease_unexpected: 
                            logger.error(f"Unexpected error processing DHCP leases: {e_lease_unexpected}", exc_info=True)
                        break 
            except Exception as e_xml_mac:
                logger.error(f"Error parsing VM XML for MAC address for {vm_name}: {e_xml_mac}", exc_info=True)

        logger.warning(f"Timeout or failure retrieving IP address for VM {vm_name} after all methods.")
        return None

    def list_domains_with_metadata(self, domain_type_filter: Optional[str] = None) -> list:
        """Lists all domains and extracts custom app metadata, optionally filtering by type."""
        domains_info = []
        try:
            all_domains = self.conn.listAllDomains(0) 
            for domain in all_domains:
                name = domain.name()
                is_active = domain.isActive()
                
                vm_type = "unknown"
                disk_path = "unknown"
                
                try:
                    xml_desc = domain.XMLDesc(0)
                    root = ElementTree.fromstring(xml_desc)
                    ns = {'app': 'http://example.com/libvirt/metadata/app'} 
                    
                    type_element = root.find(".//app:type", namespaces=ns)
                    if type_element is not None and type_element.text:
                        vm_type = type_element.text
                    
                    disk_path_element = root.find(".//app:disk_path", namespaces=ns)
                    if disk_path_element is not None and disk_path_element.text:
                        disk_path = disk_path_element.text
                except Exception as xml_e:
                    logger.debug(f"Could not parse metadata for domain {name}: {xml_e}")

                if domain_type_filter and vm_type != domain_type_filter:
                    continue

                domains_info.append({
                    "id": domain.UUIDString(), 
                    "name": name,
                    "status": "running" if is_active else "stopped",
                    "vm_type": vm_type,
                    "disk_path": disk_path,
                })
        except libvirt.libvirtError as e:
            logger.error(f"Failed to list domains: {e}")
            raise VMManagerError(f"Failed to list domains: {e}")
        return domains_info

    def get_domain_details(self, domain_name_or_uuid: str) -> Optional[dict]:
        """Gets details for a specific domain by name or UUID."""
        domain = None
        try:
            try: # Check if it's a valid UUID string first
                uuid.UUID(domain_name_or_uuid) 
                domain = self.conn.lookupByUUIDString(domain_name_or_uuid)
            except (ValueError, libvirt.libvirtError): 
                 domain = self.conn.lookupByName(domain_name_or_uuid)

        except libvirt.libvirtError as e:
            if e.get_error_code() == libvirt.VIR_ERR_NO_DOMAIN:
                logger.warning(f"Domain {domain_name_or_uuid} not found.")
                return None
            logger.error(f"Error looking up domain {domain_name_or_uuid}: {e}")
            raise VMManagerError(f"Error looking up domain {domain_name_or_uuid}: {e}")
        
        if not domain: return None

        name = domain.name()
        is_active = domain.isActive()
        vm_type = "unknown"
        disk_path = "unknown"
        memory_kb = 0
        vcpus = 0
        
        try:
            xml_desc = domain.XMLDesc(0)
            root = ElementTree.fromstring(xml_desc)
            ns = {'app': 'http://example.com/libvirt/metadata/app'}
            
            type_element = root.find(".//app:type", namespaces=ns)
            if type_element is not None and type_element.text is not None: vm_type = type_element.text
            
            disk_path_element = root.find(".//app:disk_path", namespaces=ns)
            if disk_path_element is not None and disk_path_element.text is not None: disk_path = disk_path_element.text

            memory_element = root.find("./memory")
            if memory_element is not None and memory_element.text is not None: memory_kb = int(memory_element.text)
            
            vcpu_element = root.find("./vcpu")
            if vcpu_element is not None and vcpu_element.text is not None: vcpus = int(vcpu_element.text)

        except Exception as xml_e:
            logger.warning(f"Could not parse full metadata for domain {name}: {xml_e}")

        ip_address = None
        if is_active:
            ip_address = self.get_vm_ip_address(domain, timeout_seconds=20, use_arp_fallback=(vm_type == "workspace"))


        return {
            "id": domain.UUIDString(),
            "name": name,
            "status": "running" if is_active else "stopped",
            "vm_type": vm_type,
            "disk_path": disk_path,
            "memory_mb": memory_kb // 1024 if memory_kb else 0,
            "vcpus": vcpus,
            "ip_address": ip_address,
            "ssh_port": 22, 
        }


    def close_connection(self):
        if self.conn:
            try:
                self.conn.close()
                logger.info("Libvirt connection closed.")
            except libvirt.libvirtError as e:
                logger.error(f"Failed to close libvirt connection: {e}")

# Import DigitalOcean VM manager for real cloud provisioning
try:
    from digitalocean_vm_manager import DigitalOceanVMManager, VMInstance
    CLOUD_VM_AVAILABLE = True
except ImportError:
    CLOUD_VM_AVAILABLE = False
    DigitalOceanVMManager = None
    VMInstance = None

# Enhanced VM manager with cloud integration
class EnhancedVMManager:
    """
    Enhanced VM Manager that supports both local libvirt and cloud providers
    Prioritizes DigitalOcean for real VM provisioning, falls back to libvirt
    """
    
    def __init__(self):
        self.cloud_manager = None
        self.libvirt_manager = None
        
        # Initialize cloud VM manager
        if CLOUD_VM_AVAILABLE:
            try:
                self.cloud_manager = DigitalOceanVMManager()
                logger.info("✅ Cloud VM manager (DigitalOcean) initialized")
            except Exception as e:
                logger.warning(f"⚠️ Failed to initialize cloud VM manager: {e}")
        
        # Initialize libvirt manager as fallback
        if LIBVIRT_AVAILABLE:
            try:
                self.libvirt_manager = LibvirtManager()
                logger.info("✅ Libvirt VM manager initialized as fallback")
            except Exception as e:
                logger.warning(f"⚠️ Failed to initialize libvirt manager: {e}")
        
        self.prefer_cloud = os.getenv('PREFER_CLOUD_VMS', 'true').lower() == 'true'
        
    async def create_vm(
        self,
        name: str,
        memory_mb: int = DEFAULT_VM_MEMORY_MB,
        vcpus: int = DEFAULT_VM_VCPUS,
        vm_type: str = "scout-development"
    ) -> Tuple[Any, str]:
        """
        Create VM using best available provider
        Prioritizes cloud over local libvirt
        """
        
        # Try cloud provider first if available and preferred
        if self.cloud_manager and self.prefer_cloud:
            try:
                logger.info(f"🌩️ Creating cloud VM: {name}")
                vm_instance, setup_info = await self.cloud_manager.create_vm(
                    name=name,
                    vm_type=vm_type,
                    memory_mb=memory_mb,
                    vcpus=vcpus
                )
                return vm_instance, setup_info
            except Exception as e:
                logger.warning(f"⚠️ Cloud VM creation failed, trying libvirt: {e}")
        
        # Fallback to libvirt
        if self.libvirt_manager:
            try:
                logger.info(f"🖥️ Creating local VM: {name}")
                domain, disk_path = self.libvirt_manager.define_ephemeral_vm(
                    vm_id=name,
                    memory_mb=memory_mb,
                    vcpus=vcpus
                )
                self.libvirt_manager.start_vm(domain)
                setup_info = f"Local VM created: {name} with disk at {disk_path}"
                return domain, setup_info
            except Exception as e:
                logger.error(f"❌ Libvirt VM creation failed: {e}")
        
        # Last resort: return mock VM info for development
        mock_info = f"""
        🧪 Mock VM Created (No VM providers available)
        
        📋 VM Details:
        • Name: {name}
        • Memory: {memory_mb}MB
        • CPUs: {vcpus}
        • Type: {vm_type}
        
        ⚠️ To create real VMs, set up:
        1. DIGITALOCEAN_API_TOKEN for cloud VMs
        2. Or configure libvirt for local VMs
        """
        
        return None, mock_info
    
    async def get_vm_status(self, vm_id: str) -> Dict[str, Any]:
        """Get VM status from appropriate provider"""
        
        # Try cloud provider first
        if self.cloud_manager:
            status = await self.cloud_manager.get_vm_status(vm_id)
            if "error" not in status:
                return status
        
        # Try libvirt
        if self.libvirt_manager:
            try:
                domain = self.libvirt_manager.conn.lookupByName(vm_id)
                return self.libvirt_manager.get_domain_details(vm_id)
            except Exception as e:
                pass
        
        return {"error": f"VM not found: {vm_id}"}
    
    async def list_vms(self) -> List[Dict[str, Any]]:
        """List VMs from all providers"""
        
        all_vms = []
        
        # Get cloud VMs
        if self.cloud_manager:
            try:
                cloud_vms = await self.cloud_manager.list_vms()
                for vm in cloud_vms:
                    vm["provider"] = "digitalocean"
                    all_vms.append(vm)
            except Exception as e:
                logger.warning(f"⚠️ Failed to list cloud VMs: {e}")
        
        # Get libvirt VMs
        if self.libvirt_manager:
            try:
                libvirt_vms = self.libvirt_manager.list_all_vms()
                for vm in libvirt_vms:
                    vm["provider"] = "libvirt"
                    all_vms.append(vm)
            except Exception as e:
                logger.warning(f"⚠️ Failed to list libvirt VMs: {e}")
        
        return all_vms
    
    async def stop_vm(self, vm_id: str) -> Dict[str, Any]:
        """Stop VM using appropriate provider"""
        
        # Try cloud provider first
        if self.cloud_manager:
            result = await self.cloud_manager.stop_vm(vm_id)
            if result.get("success"):
                return result
        
        # Try libvirt
        if self.libvirt_manager:
            try:
                domain = self.libvirt_manager.conn.lookupByName(vm_id)
                self.libvirt_manager.stop_vm(domain)
                return {"success": True, "message": "VM stopped via libvirt"}
            except Exception as e:
                pass
        
        return {"success": False, "error": f"VM not found: {vm_id}"}
    
    async def start_vm(self, vm_id: str) -> Dict[str, Any]:
        """Start VM using appropriate provider"""
        
        # Try cloud provider first
        if self.cloud_manager:
            result = await self.cloud_manager.start_vm(vm_id)
            if result.get("success"):
                return result
        
        # Try libvirt
        if self.libvirt_manager:
            try:
                domain = self.libvirt_manager.conn.lookupByName(vm_id)
                self.libvirt_manager.start_vm(domain)
                return {"success": True, "message": "VM started via libvirt"}
            except Exception as e:
                pass
        
        return {"success": False, "error": f"VM not found: {vm_id}"}
    
    async def delete_vm(self, vm_id: str) -> Dict[str, Any]:
        """Delete VM using appropriate provider"""
        
        # Try cloud provider first
        if self.cloud_manager:
            result = await self.cloud_manager.delete_vm(vm_id)
            if result.get("success"):
                return result
        
        # Try libvirt
        if self.libvirt_manager:
            try:
                domain = self.libvirt_manager.conn.lookupByName(vm_id)
                self.libvirt_manager.delete_vm(domain)
                return {"success": True, "message": "VM deleted via libvirt"}
            except Exception as e:
                pass
        
        return {"success": False, "error": f"VM not found: {vm_id}"}
    
    async def get_ssh_info(self, vm_id: str) -> Dict[str, Any]:
        """Get SSH connection info for VM"""
        
        # Try cloud provider first (has better SSH support)
        if self.cloud_manager:
            ssh_info = await self.cloud_manager.get_ssh_connection_info(vm_id)
            if "error" not in ssh_info:
                return ssh_info
        
        # Try libvirt (limited SSH support)
        if self.libvirt_manager:
            try:
                domain = self.libvirt_manager.conn.lookupByName(vm_id)
                ip = self.libvirt_manager.get_vm_ip(domain)
                if ip:
                    return {
                        "host": ip,
                        "port": 22,
                        "username": "root",
                        "connection_string": f"ssh root@{ip}",
                        "note": "Libvirt VM - SSH may not be configured"
                    }
            except Exception as e:
                pass
        
        return {"error": f"SSH info not available for VM: {vm_id}"}
    
    def get_available_providers(self) -> List[str]:
        """Get list of available VM providers"""
        
        providers = []
        
        if self.cloud_manager and hasattr(self.cloud_manager, 'api_available') and self.cloud_manager.api_available:
            providers.append("digitalocean")
        
        if self.libvirt_manager:
            providers.append("libvirt")
        
        if not providers:
            providers.append("mock")
        
        return providers
    
    def get_cost_estimate(self, vm_type: str = "scout-development") -> Dict[str, Any]:
        """Get cost estimate for VM types"""
        
        if self.cloud_manager and hasattr(self.cloud_manager, 'vm_sizes'):
            size_config = self.cloud_manager.vm_sizes.get(vm_type)
            if size_config:
                return {
                    "vm_type": vm_type,
                    "monthly_cost": size_config["cost_monthly"],
                    "hourly_cost": round(size_config["cost_monthly"] / 730, 4),
                    "memory_mb": size_config["memory_mb"],
                    "vcpus": size_config["vcpus"],
                    "provider": "digitalocean"
                }
        
        return {
            "vm_type": vm_type,
            "monthly_cost": 0,
            "hourly_cost": 0,
            "memory_mb": DEFAULT_VM_MEMORY_MB,
            "vcpus": DEFAULT_VM_VCPUS,
            "provider": "local/mock"
        }

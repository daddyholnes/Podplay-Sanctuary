import libvirt
import os
import uuid
import logging
import time
import subprocess
from typing import Dict, List, Optional, Any, Tuple # Added for type hints
from xml.etree import ElementTree # For parsing XML metadata

logger = logging.getLogger(__name__)

# Configuration (Ideally from app config or .env)
BASE_QCOW2_IMAGE_PATH = os.getenv("NIXOS_SANDBOX_BASE_IMAGE", "/var/lib/libvirt/images/nixos-sandbox-base.qcow2")
# Directory for ephemeral sandbox instances
EPHEMERAL_VM_IMAGES_DIR = os.getenv("NIXOS_EPHEMERAL_VM_IMAGES_DIR", "/var/lib/libvirt/images/sandbox_instances")
# Directory for persistent workspace VMs
WORKSPACE_VM_IMAGES_DIR = os.getenv("NIXOS_WORKSPACE_VM_IMAGES_DIR", "/var/lib/libvirt/images/workspaces")

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
        try:
            self.conn = libvirt.open(connection_uri)
        except libvirt.libvirtError as e:
            logger.error(f"Failed to connect to libvirt: {e}")
            raise VMManagerError(f"Failed to connect to libvirt: {e}")
        if self.conn is None: # Should be redundant if open() fails, but good practice
            logger.error("Failed to open connection to libvirt, self.conn is None.")
            raise VMManagerError("Failed to open connection to libvirt, self.conn is None.")

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

    def _generic_define_vm(self, vm_id: str, disk_path: str, memory_mb: int, vcpus: int, enable_network: bool = False, domain_type: str = "ephemeral") -> libvirt.virDomain:
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

    def define_ephemeral_vm(self, vm_id: str, memory_mb: int = DEFAULT_VM_MEMORY_MB, vcpus: int = DEFAULT_VM_VCPUS) -> tuple[libvirt.virDomain, str]:
        """Defines a new ephemeral VM domain using an overlay image (no network by default)."""
        overlay_image_path = self._create_qcow2_image(vm_id, base_image_path=BASE_QCOW2_IMAGE_PATH, target_dir=EPHEMERAL_VM_IMAGES_DIR)
        domain = self._generic_define_vm(vm_id, overlay_image_path, memory_mb, vcpus, enable_network=False, domain_type="ephemeral")
        return domain, overlay_image_path

    def define_workspace_vm(self, workspace_id: str, memory_mb: int = DEFAULT_WORKSPACE_MEMORY_MB, vcpus: int = DEFAULT_WORKSPACE_VCPUS) -> tuple[libvirt.virDomain, str]:
        """Defines a new persistent workspace VM, using an overlay image stored in the workspace directory."""
        workspace_disk_path = self._create_qcow2_image(
            workspace_id, 
            base_image_path=BASE_QCOW2_IMAGE_PATH, 
            target_dir=WORKSPACE_VM_IMAGES_DIR
        )
        domain = self._generic_define_vm(workspace_id, workspace_disk_path, memory_mb, vcpus, enable_network=True, domain_type="workspace")
        return domain, workspace_disk_path

    def _get_domain_object(self, domain_or_name: str | libvirt.virDomain) -> libvirt.virDomain:
        """Helper to get a domain object if a name is passed."""
        if isinstance(domain_or_name, str):
            try:
                return self.conn.lookupByName(domain_or_name)
            except libvirt.libvirtError as e:
                if e.get_error_code() == libvirt.VIR_ERR_NO_DOMAIN:
                    raise VMManagerError(f"VM with name '{domain_or_name}' not found.")
                raise VMManagerError(f"Error looking up VM '{domain_or_name}': {e}")
        return domain_or_name

    def start_vm(self, domain_or_name: str | libvirt.virDomain):
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

    def stop_vm(self, domain_or_name: str | libvirt.virDomain, force: bool = False, for_workspace: bool = False):
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


    def undefine_vm(self, domain_or_name: str | libvirt.virDomain):
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
            
    def cleanup_ephemeral_vm_resources(self, domain: libvirt.virDomain, overlay_image_path: str):
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


    def get_vm_ip_address(self, domain_or_name: str | libvirt.virDomain, timeout_seconds=120, use_arp_fallback=False) -> str | None:
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

# Example usage (for testing this module directly)
# Note: This direct test requires libvirtd to be running and configured,
# a base NixOS qcow2 image, and proper SSH key setup.
if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    # Create a dummy base qcow2 image if it doesn't exist and specific env var is set
    # THIS IS FOR LOCAL TESTING OF THE MODULE ONLY. DO NOT RELY ON THIS FOR PRODUCTION.
    if not os.path.exists(BASE_QCOW2_IMAGE_PATH) :
        if "LIBVIRT_TEST_CREATE_DUMMY_BASE" in os.environ:
            logger.info(f"Attempting to create dummy base image at {BASE_QCOW2_IMAGE_PATH} for testing...")
            try:
                os.makedirs(os.path.dirname(BASE_QCOW2_IMAGE_PATH), exist_ok=True)
                subprocess.run(["qemu-img", "create", "-f", "qcow2", BASE_QCOW2_IMAGE_PATH, "1G"], check=True)
                logger.info(f"Dummy base image created. Note: VMs created from this WILL NOT BOOT but libvirt ops can be tested.")
            except Exception as e_dummy:
                logger.error(f"Failed to create dummy base image: {e_dummy}. Some tests might fail or be inaccurate.")
        else:
            logger.error(f"Base image {BASE_QCOW2_IMAGE_PATH} does not exist. Please create it or set NIXOS_SANDBOX_BASE_IMAGE.")
            logger.error("For testing this module directly without a real NixOS image, set LIBVIRT_TEST_CREATE_DUMMY_BASE=true (VMs will not boot).")
            # exit(1) # Decide if exiting is appropriate or allow tests to proceed with potential failures.
                      # For now, let it proceed to see libvirt interaction attempts.

    manager = None
    eph_domain_obj = None
    eph_overlay_path = None
    ws_domain_obj = None
    ws_disk_path = None
    
    eph_vm_id = f"test-eph-{uuid.uuid4()}"
    ws_vm_id = f"test-ws-{uuid.uuid4()}"

    try:
        manager = LibvirtManager()
        logger.info("LibvirtManager initialized.")
        
        # Test Ephemeral VM
        logger.info(f"\n--- Testing Ephemeral VM: {eph_vm_id} ---")
        eph_domain_obj, eph_overlay_path = manager.define_ephemeral_vm(eph_vm_id)
        logger.info(f"Ephemeral VM {eph_vm_id} defined with overlay {eph_overlay_path}")
        manager.start_vm(eph_domain_obj) # Use object
        logger.info(f"Ephemeral VM {eph_vm_id} started.")
        time.sleep(1) 
        if eph_domain_obj.isActive(): logger.info(f"Ephemeral VM {eph_vm_id} is active.")
        else: logger.warning(f"Ephemeral VM {eph_vm_id} is NOT active after start attempt.")
        manager.cleanup_ephemeral_vm_resources(eph_domain_obj, eph_overlay_path) # Use object
        logger.info(f"Ephemeral VM {eph_vm_id} cleaned up.")
        try:
            manager.conn.lookupByName(eph_vm_id)
            logger.error(f"ERROR: Ephemeral VM {eph_vm_id} still found after cleanup!")
        except libvirt.libvirtError:
            logger.info(f"Ephemeral VM {eph_vm_id} correctly not found after cleanup.")

        # Test Workspace VM
        logger.info(f"\n--- Testing Workspace VM: {ws_vm_id} ---")
        ws_domain_obj, ws_disk_path = manager.define_workspace_vm(ws_vm_id)
        logger.info(f"Workspace VM {ws_vm_id} defined with disk {ws_disk_path}")
        manager.start_vm(ws_vm_id) # Use name
        logger.info(f"Workspace VM {ws_vm_id} started.")
        
        # Re-fetch domain object if started by name, to ensure it's fresh
        ws_domain_obj_fresh = manager._get_domain_object(ws_vm_id)

        ws_ip = manager.get_vm_ip_address(ws_domain_obj_fresh, timeout_seconds=30, use_arp_fallback=True) # Reduced timeout for testing
        if ws_ip: logger.info(f"Workspace VM IP: {ws_ip}")
        else: logger.warning(f"Could not get IP for workspace VM {ws_vm_id} (expected if dummy image or no DHCP/guest agent).")

        time.sleep(2)
        if ws_domain_obj_fresh.isActive():
            logger.info(f"Workspace VM {ws_vm_id} is active. Stopping gracefully...")
            manager.stop_vm(ws_vm_id, for_workspace=True) # Use name
            # Wait a bit for graceful shutdown to reflect
            for _i in range(10): # Max 10 seconds
                time.sleep(1)
                ws_domain_obj_check_stop = manager._get_domain_object(ws_vm_id) # fetch fresh object
                if not ws_domain_obj_check_stop.isActive(): break
            
            ws_domain_obj_final_check = manager._get_domain_object(ws_vm_id) # one last fresh object
            if not ws_domain_obj_final_check.isActive():
                 logger.info(f"Workspace VM {ws_vm_id} stopped gracefully.")
            else: 
                state, reason = ws_domain_obj_final_check.state()
                logger.warning(f"Workspace VM {ws_vm_id} might not have stopped gracefully (state: {state}, reason: {reason}). Forcing for cleanup if needed.")
        
        logger.info("\n--- Listing all domains (includes workspace) ---")
        all_domains_meta = manager.list_domains_with_metadata()
        for d_meta in all_domains_meta:
            logger.info(f"  Listed Domain: ID={d_meta['id']}, Name: {d_meta['name']}, Type: {d_meta['vm_type']}, Status: {d_meta['status']}, Disk: {d_meta['disk_path']}")
        
        logger.info(f"\n--- Getting details for workspace VM: {ws_vm_id} ---")
        ws_details = manager.get_domain_details(ws_vm_id) # Use name
        if ws_details:
            logger.info(f"  Workspace Details: {ws_details}")

    except VMManagerError as e:
        logger.error(f"VM Management Error during test: {e}", exc_info=True)
    except Exception as e_global:
        logger.error(f"An unexpected error occurred during test: {e_global}", exc_info=True)
    finally:
        if manager:
            if ws_domain_obj and ws_disk_path: 
                logger.info(f"\n--- Deleting Workspace VM: {ws_vm_id} for test cleanup ---")
                try:
                    # Try to get a fresh domain object for deletion, as ws_domain_obj might be stale
                    # or operations like stop might have invalidated it for some libvirt versions/contexts.
                    domain_to_delete = manager._get_domain_object(ws_vm_id)
                    manager.delete_workspace_vm(domain_to_delete) 
                except VMManagerError as e_lookup: # If lookup fails (e.g. already undefined)
                    logger.warning(f"Could not re-lookup workspace VM {ws_vm_id} for deletion, attempting disk cleanup. Error: {e_lookup}")
                    # Attempt direct disk cleanup if domain is gone from libvirt but disk might remain
                    if os.path.exists(ws_disk_path) and WORKSPACE_VM_IMAGES_DIR in os.path.abspath(ws_disk_path):
                        try:
                            os.remove(ws_disk_path)
                            logger.info(f"Removed workspace disk directly: {ws_disk_path}")
                        except OSError as e_rm_disk:
                            logger.error(f"Failed to remove workspace disk directly {ws_disk_path}: {e_rm_disk}")
                except Exception as e_del:
                     logger.error(f"Error deleting workspace VM {ws_vm_id} during cleanup: {e_del}", exc_info=True)
            elif ws_disk_path and os.path.exists(ws_disk_path) and WORKSPACE_VM_IMAGES_DIR in os.path.abspath(ws_disk_path):
                 logger.info(f"Workspace domain object for {ws_vm_id} not available or lookup failed, attempting disk cleanup only.")
                 try:
                    os.remove(ws_disk_path)
                    logger.info(f"Cleaned up orphaned workspace disk: {ws_disk_path}")
                 except OSError as e_rm_orphan:
                    logger.error(f"Error cleaning up orphaned workspace disk {ws_disk_path}: {e_rm_orphan}")
            
            if eph_domain_obj and eph_overlay_path: 
                 try:
                     eph_dom_check_final = manager._get_domain_object(eph_vm_id) # Use helper
                     if eph_dom_check_final: 
                         logger.warning(f"Ephemeral VM {eph_vm_id} found unexpectedly at very end of test. Attempting cleanup again.")
                         manager.cleanup_ephemeral_vm_resources(eph_dom_check_final, eph_overlay_path)
                 except VMManagerError: # Expected if already cleaned up / not found by name
                     logger.info(f"Ephemeral VM {eph_vm_id} was confirmed cleaned up or not found by name at end.")
                 except Exception as e_eph_final_cleanup:
                     logger.error(f"Final cleanup error for ephemeral VM {eph_vm_id}: {e_eph_final_cleanup}")
            manager.close_connection()
        logger.info("Test run finished.")

# TODO:
# - XML refinement for NixOS specifics (boot device order if needed).
# - Ensure qemu-guest-agent (`services.qemuGuest.enable = true;`) is in the NixOS base image for reliable IP/status.
# - PCI slot assignment in XML could be made more dynamic or checked for conflicts if more devices are added.
# - Consider using domain UUIDs more consistently for lookups after definition if names might have issues.

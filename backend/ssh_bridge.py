"""
SSH Bridge Module for VM Communication

This module provides a bridge for SSH communication with NixOS VMs, specifically
designed for web-based terminal access. It handles PTY allocation, I/O streaming,
and terminal resizing.
"""

import os
import logging
import socket
import threading
import time
from queue import Queue, Empty as QueueEmpty
from typing import Optional, Any, List, Dict, Union, Tuple

import paramiko

logger = logging.getLogger(__name__)

# SSH Configuration (should align with ssh_executor.py and VM setup)
SSH_USERNAME = os.getenv("NIXOS_VM_SSH_USER", "executor")
SSH_PRIVATE_KEY_PATH = os.getenv(
    "NIXOS_VM_SSH_KEY_PATH", 
    os.path.expanduser("~/.ssh/id_rsa_nixos_vm_executor")
)

class SSHBridgeError(Exception):
    """Exception raised for SSH bridge related errors."""
    pass

class VMSSHBridge:
    """
    A bridge for SSH communication with a VM, providing PTY-based terminal access.
    
    This class handles the SSH connection, PTY allocation, and provides methods
    for sending input and receiving output from the remote shell.
    """
    
    def __init__(self, host_ip: str, port: int = 22, 
                 username: str = SSH_USERNAME, 
                 private_key_path: str = SSH_PRIVATE_KEY_PATH):
        """Initialize the SSH bridge.
        
        Args:
            host_ip: IP address of the target VM
            port: SSH port (default: 22)
            username: SSH username (default: from env or 'executor')
            private_key_path: Path to private key for authentication
        """
        self.host_ip = host_ip
        self.port = port
        self.username = username
        self.private_key_path = os.path.expanduser(private_key_path)
        
        self.client: Optional[paramiko.SSHClient] = None
        self.channel: Optional[paramiko.Channel] = None
        self.output_queue: Queue[str] = Queue()  # For relaying SSH output to WebSocket
        self._stop_event = threading.Event()
        self._recv_thread: Optional[threading.Thread] = None

        if not os.path.exists(self.private_key_path):
            msg = f"SSHBridge: Private key not found at {self.private_key_path}"
            logger.error(msg)
            raise SSHBridgeError(msg)
        
        self._connect_and_open_pty()

    def _connect_and_open_pty(self) -> None:
        """Establish SSH connection and open a PTY session."""
        try:
            self.client = paramiko.SSHClient()
            self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            pkey = paramiko.RSAKey.from_private_key_file(self.private_key_path)

            logger.info(f"SSHBridge: Connecting to {self.username}@{self.host_ip}:{self.port} for terminal...")
            self.client.connect(
                hostname=self.host_ip,
                port=self.port,
                username=self.username,
                pkey=pkey,
                timeout=10,
                auth_timeout=10,
                banner_timeout=30
            )
            
            # Request a PTY (pseudo-terminal)
            self.channel = self.client.invoke_shell(term='xterm-256color', width=80, height=24)
            self.channel.settimeout(0.0)  # Non-blocking for recv
            self.channel.get_pty()  # Ensure PTY is allocated

            logger.info(f"SSHBridge: PTY shell opened to {self.host_ip}")

            # Start a thread to read from SSH channel and put into queue
            self._recv_thread = threading.Thread(target=self._recv_loop, daemon=True)
            self._recv_thread.start()

        except paramiko.AuthenticationException as e:
            msg = f"SSHBridge: Authentication failed for {self.username}@{self.host_ip}: {e}"
            logger.error(msg)
            self.close()  # Ensure client is closed if connection part fails
            raise SSHBridgeError(msg)
        except paramiko.SSHException as e:
            msg = f"SSHBridge: Connection error to {self.username}@{self.host_ip}: {e}"
            logger.error(msg)
            self.close()
            raise SSHBridgeError(msg)
        except Exception as e:
            msg = f"SSHBridge: Unexpected error opening PTY to {self.username}@{self.host_ip}: {e}"
            logger.error(msg, exc_info=True)
            self.close()
            raise SSHBridgeError(msg)

    def _recv_loop(self) -> None:
        """Continuously read data from SSH channel and put it on the output queue."""
        try:
            while not self._stop_event.is_set() and self.channel and self.client.get_transport() and self.client.get_transport().is_active():
                try:
                    if self.channel.recv_ready():
                        data = self.channel.recv(4096)
                        if data:
                            try:
                                self.output_queue.put(data.decode('utf-8', errors='replace'))
                            except (UnicodeDecodeError, Exception) as enc_err:
                                logger.warning(
                                    f"SSHBridge: Error decoding data from SSH: {enc_err}, "
                                    f"data (raw): {data[:100]}"
                                )
                        else:  # No data or channel closed (recv returns empty bytes)
                            logger.info(f"SSHBridge: Channel closed or no data from {self.host_ip}.")
                            self._stop_event.set()
                            break
                    elif self.channel.exit_status_ready():  # Check if shell session ended
                        logger.info(f"SSHBridge: Shell session ended on {self.host_ip}.")
                        self._stop_event.set()
                        break
                    
                    time.sleep(0.01)  # Small sleep to prevent busy-waiting

                except socket.timeout:  # Normal for non-blocking mode
                    continue
                except Exception as e:
                    logger.error(f"SSHBridge: Error in recv loop for {self.host_ip}: {e}", exc_info=True)
                    self._stop_event.set()  # Signal to stop on other errors
                    break
        except Exception as e:
            logger.error(f"SSHBridge: Fatal error in recv_loop for {self.host_ip}: {e}", exc_info=True)
        finally:
            logger.info(f"SSHBridge: Receive loop for {self.host_ip} terminated.")
            self.output_queue.put(None)  # Signal end of stream to consumers

    def send_input(self, data: str) -> None:
        """Send data (e.g., user input from web terminal) to the SSH channel.
        
        Args:
            data: Input data to send to the remote shell
            
        Raises:
            SSHBridgeError: If there's an error sending data
        """
        if not self.is_active():
            msg = f"SSHBridge: Cannot send input, connection to {self.host_ip} is not active."
            logger.warning(msg)
            raise SSHBridgeError(msg)
            
        try:
            self.channel.send(data)
        except Exception as e:
            error_msg = f"SSHBridge: Error sending data to {self.host_ip}: {e}"
            logger.error(error_msg, exc_info=True)
            self.close()  # Close on send error, as channel might be broken
            raise SSHBridgeError(error_msg)

    def resize_pty(self, cols: int, rows: int, width_pixels: int = 0, height_pixels: int = 0) -> None:
        """Resize the PTY on the remote server.
        
        Args:
            cols: Number of columns
            rows: Number of rows
            width_pixels: Width in pixels (optional)
            height_pixels: Height in pixels (optional)
        """
        if not self.is_active():
            return
            
        try:
            self.channel.resize_pty(
                width=cols,
                height=rows,
                width_pixels=width_pixels if width_pixels > 0 else cols * 8,  # Estimate pixel width
                height_pixels=height_pixels if height_pixels > 0 else rows * 16  # Estimate pixel height
            )
            logger.debug(f"SSHBridge: Resized PTY on {self.host_ip} to cols={cols}, rows={rows}")
        except Exception as e:
            logger.error(f"SSHBridge: Error resizing PTY on {self.host_ip}: {e}", exc_info=True)

    def get_output(self, timeout: float = 0.1) -> Optional[str]:
        """Get data from the output queue (non-blocking with timeout).
        
        Args:
            timeout: Maximum time to wait for output (in seconds)
            
        Returns:
            str: The output data, empty string if no data available, or None if connection closed
        """
        if not self.is_active() and self.output_queue.empty():
            return None  # Signal that no more output will come and queue is drained
            
        try:
            return self.output_queue.get(block=True, timeout=timeout)
        except QueueEmpty:
            return ""  # No output currently available
        except Exception as e:
            logger.error(f"SSHBridge: Error getting output from queue for {self.host_ip}: {e}")
            return None

    def is_active(self) -> bool:
        """Check if the SSH connection and channel are active.
        
        Returns:
            bool: True if the connection is active, False otherwise
        """
        return (not self._stop_event.is_set() and 
                self.client is not None and
                self.client.get_transport() is not None and 
                self.client.get_transport().is_active() and 
                self.channel is not None and
                not self.channel.closed)

    def close(self) -> None:
        """Close the SSH connection and stop the receive thread."""
        if self._stop_event.is_set():
            return  # Already closed
            
        logger.info(f"SSHBridge: Closing connection to {self.host_ip}...")
        self._stop_event.set()  # Signal the receive thread to stop

        # Close channel if it exists and isn't already closed
        if self.channel and not getattr(self.channel, 'closed', True):
            try:
                self.channel.close()
            except Exception as e_chan:
                logger.debug(
                    f"SSHBridge: Error closing channel for {self.host_ip} "
                    f"(may already be closed): {e_chan}"
                )
            self.channel = None
        
        # Close client if it exists
        if self.client:
            try:
                self.client.close()
            except Exception as e_client:
                logger.debug(
                    f"SSHBridge: Error closing client for {self.host_ip} "
                    f"(may already be closed): {e_client}"
                )
            self.client = None
        
        # Ensure thread is joined
        if self._recv_thread and self._recv_thread.is_alive():
            self._recv_thread.join(timeout=1.0)  # Wait for thread to exit
            if self._recv_thread.is_alive():
                logger.warning(f"SSHBridge: Receive thread for {self.host_ip} did not terminate cleanly.")
        
        logger.info(f"SSHBridge: Connection to {self.host_ip} closed.")
        
    def __del__(self):
        """Ensure resources are cleaned up when object is garbage collected."""
        self.close()


def main() -> None:
    """Test the SSH bridge with a simple interactive session."""
    import sys
    
    logging.basicConfig(
        level=logging.DEBUG, 
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        stream=sys.stdout
    )
    
    test_host = os.getenv("NIXOS_TEST_VM_IP")
    if not test_host:
        print("Error: NIXOS_TEST_VM_IP environment variable not set")
        print("Please set it to the IP of your test VM")
        sys.exit(1)
    
    bridge = None
    try:
        print(f"Connecting to {test_host}...")
        bridge = VMSSHBridge(host_ip=test_host)
        
        # Send a test command
        bridge.send_input("echo 'Hello from SSHBridge!'\n")
        
        # Print output for a while
        print("\n--- Output from VM (press Ctrl+C to stop) ---")
        start_time = time.time()
        while time.time() - start_time < 30:  # Run for up to 30 seconds
            try:
                output = bridge.get_output(timeout=0.5)
                if output is None:  # None means connection closed
                    print("\nConnection closed by remote host")
                    break
                if output:  # Print if there's output
                    print(output, end='', flush=True)
            except KeyboardInterrupt:
                print("\nStopping...")
                break
            except Exception as e:
                print(f"\nError reading output: {e}")
                break
                
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if bridge:
            bridge.close()
        print("\n--- Test Finished ---")


if __name__ == '__main__':
    main()

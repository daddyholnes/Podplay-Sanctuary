import paramiko
import logging
import threading
import os
from queue import Queue, Empty as QueueEmpty

logger = logging.getLogger(__name__)

# SSH Configuration (should align with ssh_executor.py and VM setup)
SSH_USERNAME = os.getenv("NIXOS_VM_SSH_USER", "executor")
SSH_PRIVATE_KEY_PATH = os.getenv("NIXOS_VM_SSH_KEY_PATH", "~/.ssh/id_rsa_nixos_vm_executor")

class SSHBridgeError(Exception):
    pass

class VMSSHBridge:
    def __init__(self, host_ip: str, port: int = 22, username: str = SSH_USERNAME, private_key_path: str = SSH_PRIVATE_KEY_PATH):
        self.host_ip = host_ip
        self.port = port
        self.username = username
        self.private_key_path = os.path.expanduser(private_key_path)
        
        self.client: Optional[paramiko.SSHClient] = None
        self.channel: Optional[paramiko.Channel] = None
        self.output_queue: Queue[str] = Queue() # For relaying SSH output to WebSocket
        self._stop_event = threading.Event()
        self._recv_thread: Optional[threading.Thread] = None

        if not os.path.exists(self.private_key_path):
            msg = f"SSHBridge: Private key not found at {self.private_key_path}"
            logger.error(msg)
            raise SSHBridgeError(msg)
        
        self._connect_and_open_pty()

    def _connect_and_open_pty(self):
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
                auth_timeout=10
            )
            
            # Request a PTY (pseudo-terminal)
            # Dimensions can be adjusted or passed from client
            self.channel = self.client.invoke_shell(term='xterm-color', width=80, height=24) 
            self.channel.settimeout(0.0) # Non-blocking for recv

            logger.info(f"SSHBridge: PTY shell opened to {self.host_ip}")

            # Start a thread to read from SSH channel and put into queue
            self._recv_thread = threading.Thread(target=self._recv_loop, daemon=True)
            self._recv_thread.start()

        except paramiko.AuthenticationException as e:
            msg = f"SSHBridge: Authentication failed for {self.username}@{self.host_ip}: {e}"
            logger.error(msg)
            self.close() # Ensure client is closed if connection part fails
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

    def _recv_loop(self):
        """Continuously read data from SSH channel and put it on the output queue."""
        try:
            while not self._stop_event.is_set() and self.channel and self.channel.recv_ready():
                try:
                    # Non-blocking read with timeout on channel itself is tricky for recv_ready loop.
                    # Using channel.recv_ready() and then channel.recv() is one way.
                    # A small sleep helps prevent tight looping if no data immediately after recv_ready.
                    if self.channel.recv_ready():
                        data = self.channel.recv(4096)
                        if data:
                            try:
                                self.output_queue.put(data.decode('utf-8', errors='replace'))
                            except (UnicodeDecodeError, Exception) as enc_err:
                                logger.warning(f"SSHBridge: Error decoding data from SSH: {enc_err}, data (raw): {data[:100]}")
                                # Attempt to send raw if decode fails badly, or handle appropriately
                        else: # No data or channel closed (recv returns empty bytes)
                            logger.info(f"SSHBridge: Channel closed or no data from {self.host_ip}.")
                            self._stop_event.set() # Signal to stop
                            break 
                    elif self.channel.exit_status_ready(): # Check if shell session ended
                        logger.info(f"SSHBridge: Shell session ended on {self.host_ip}.")
                        self._stop_event.set()
                        break
                    
                    time.sleep(0.01) # Small sleep to prevent busy-waiting if recv_ready is true but recv would block

                except socket.timeout: # This timeout is on the channel itself, not recv
                    continue # Normal for non-blocking mode, just means no data
                except Exception as e:
                    logger.error(f"SSHBridge: Error in recv loop for {self.host_ip}: {e}", exc_info=True)
                    self._stop_event.set() # Signal to stop on other errors
                    break
        finally:
            logger.info(f"SSHBridge: Receive loop for {self.host_ip} terminated.")
            # Optionally, put a special marker or None in queue to signal termination to consumers
            self.output_queue.put(None) 

    def send_input(self, data: str):
        """Send data (e.g., user input from web terminal) to the SSH channel."""
        if self.channel and self.channel.send_ready() and not self._stop_event.is_set():
            try:
                self.channel.send(data)
            except Exception as e:
                logger.error(f"SSHBridge: Error sending data to {self.host_ip}: {e}", exc_info=True)
                self.close() # Close on send error, as channel might be broken
                raise SSHBridgeError(f"Error sending data to SSH channel: {e}")
        elif not self.channel or self._stop_event.is_set():
            msg = f"SSHBridge: Cannot send input, channel to {self.host_ip} is not active."
            logger.warning(msg)
            # raise SSHBridgeError(msg) # Decide if this should be a hard error

    def resize_pty(self, cols: int, rows: int, width_pixels: int = 0, height_pixels: int = 0):
        """Resize the PTY on the remote server."""
        if self.channel and not self._stop_event.is_set():
            try:
                self.channel.resize_pty(width=cols, height=rows, width_pixels=width_pixels, height_pixels=height_pixels)
                logger.info(f"SSHBridge: Resized PTY on {self.host_ip} to cols={cols}, rows={rows}")
            except Exception as e:
                logger.error(f"SSHBridge: Error resizing PTY on {self.host_ip}: {e}", exc_info=True)
                # Not necessarily a fatal error for the bridge itself

    def get_output(self, timeout: float = 0.1) -> Optional[str]:
        """Get data from the output queue (non-blocking with timeout)."""
        if self._stop_event.is_set() and self.output_queue.empty():
            return None # Signal that no more output will come and queue is drained
        try:
            return self.output_queue.get(block=True, timeout=timeout)
        except QueueEmpty:
            return "" # No output currently available
        except Exception as e:
            logger.error(f"SSHBridge: Error getting output from queue for {self.host_ip}: {e}")
            return None # Indicate an error or end

    def is_active(self) -> bool:
        """Check if the SSH connection and channel are active."""
        return not self._stop_event.is_set() and self.client is not None and \
               self.client.get_transport() is not None and \
               self.client.get_transport().is_active() and \
               self.channel is not None

    def close(self):
        """Close the SSH connection and stop the receive thread."""
        logger.info(f"SSHBridge: Closing connection to {self.host_ip}...")
        self._stop_event.set() # Signal the receive thread to stop

        if self.channel:
            try:
                if not self.channel.closed:
                    self.channel.close()
            except Exception as e_chan:
                logger.debug(f"SSHBridge: Error closing channel for {self.host_ip} (may already be closed): {e_chan}")
            self.channel = None
        
        if self.client:
            try:
                self.client.close()
            except Exception as e_client:
                logger.debug(f"SSHBridge: Error closing client for {self.host_ip} (may already be closed): {e_client}")
            self.client = None
        
        # Ensure thread is joined
        if self._recv_thread and self._recv_thread.is_alive():
            self._recv_thread.join(timeout=1.0) # Wait for thread to exit
            if self._recv_thread.is_alive():
                 logger.warning(f"SSHBridge: Receive thread for {self.host_ip} did not terminate cleanly.")
        
        logger.info(f"SSHBridge: Connection to {self.host_ip} closed.")

# Minimal example for direct testing (requires a running SSH server)
if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    TEST_SSH_HOST = os.getenv("NIXOS_TEST_VM_IP") # Use an IP of a test VM
    if not TEST_SSH_HOST:
        print("Please set NIXOS_TEST_VM_IP to test SSHBridge.")
        exit(1)
    
    bridge = None
    try:
        bridge = VMSSHBridge(host_ip=TEST_SSH_HOST)
        
        # Simulate sending a command
        bridge.send_input("ls -la\n")
        time.sleep(0.5) # Give some time for output
        bridge.send_input("echo 'Hello from bridge test'\n")
        time.sleep(0.5)
        bridge.send_input("exit\n") # Exit the shell

        # Read output
        print("\n--- Terminal Output ---")
        while bridge.is_active() or not bridge.output_queue.empty():
            output = bridge.get_output(timeout=0.2)
            if output is None : # End of stream marker or error
                if bridge.is_active(): # Should not happen if None is only for "stream ended"
                    logger.warning("Bridge active but got None from output queue without explicit end.")
                break
            if output: # Non-empty string
                print(output, end='')
            # If output is empty string, it's just a timeout on get_output, loop again if active
            if not bridge.is_active() and bridge.output_queue.empty(): # Ensure loop terminates if bridge inactive and queue empty
                break
            time.sleep(0.05) # Small delay to allow more output to accumulate

    except SSHBridgeError as e:
        print(f"SSH Bridge Error: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")
    finally:
        if bridge:
            bridge.close()
        print("\n--- Test Finished ---")

```

**Explanation of `ssh_bridge.py`:**

*   **`VMSSHBridge` Class:**
    *   **`__init__` & `_connect_and_open_pty`:**
        *   Takes host IP and SSH credentials.
        *   Uses `paramiko` to connect.
        *   Crucially, calls `client.invoke_shell(term='xterm-color', ...)` to get an interactive PTY (pseudo-terminal) channel. This is what's needed for a web terminal.
        *   Sets the channel to non-blocking (`settimeout(0.0)`).
        *   Starts a background thread (`_recv_loop`) to continuously read from the SSH channel.
    *   **`_recv_loop`:**
        *   Runs in a separate thread.
        *   Continuously checks `channel.recv_ready()` and `channel.exit_status_ready()`.
        *   Reads available data using `channel.recv(4096)`.
        *   Puts the decoded data (UTF-8) into `self.output_queue`.
        *   Handles channel closure or errors by setting `self._stop_event`.
        *   Puts `None` into queue upon termination to signal consumers.
    *   **`send_input(data: str)`:** Sends data (typically user input from the web terminal) to the SSH channel's PTY.
    *   **`resize_pty(cols: int, rows: int, ...)`:** Sends a PTY resize request to the SSH server, allowing the remote terminal to adjust its dimensions.
    *   **`get_output(timeout: float)`:** Retrieves data from the `output_queue` in a non-blocking way (with a short timeout). This will be called by the WebSocket handler to send data to the client. Returns `""` if no data currently, `None` if stream ended.
    *   **`is_active()`:** Checks if the SSH connection and channel are considered active.
    *   **`close()`:** Gracefully closes the SSH channel and client, and stops the receive thread.
*   **Threading:** A thread is used for `_recv_loop` to avoid blocking the main WebSocket handling thread while waiting for SSH output. Data is passed from this thread to the main thread via a thread-safe `queue.Queue`.
*   **Error Handling:** Includes `SSHBridgeError` and logs various stages.
*   **Example Usage (`if __name__ == '__main__':`)**: A simple test to connect, send a few commands, and print output. Requires `NIXOS_TEST_VM_IP` to be set.

This module now provides the core SSH PTY interaction logic. The next step is to use this class within Flask-SocketIO event handlers in `app.py`.I have created `backend/ssh_bridge.py` in the previous turn.
Now, I will implement the Scout Agent Logging module, `scout_logger.py`, using TinyDB.

**Plan for `scout_logger.py`:**

1.  **Install TinyDB:** I'll assume `pip install tinydb` can be run.
2.  **Create `scout_logger.py`:**
    *   **Configuration:** Define a path for TinyDB database files (e.g., from an environment variable `SCOUT_LOGS_DIR`, defaulting to `./scout_logs/`). Ensure this directory is created.
    *   **`ScoutAgentDBManager` Class:**
        *   Manages TinyDB instances, possibly one DB file per project (`{project_id}.json`).
        *   `_get_db(project_id)`: Helper to get or create a TinyDB instance for a project.
    *   **`ScoutProjectLogger` Class:**
        *   Initialized with a `project_id` and the `ScoutAgentDBManager`.
        *   `log_entry()`: A flexible method to log various types of entries. It will take structured data (e.g., a dictionary) and insert it into the project's TinyDB table. The schema from the design document will be the basis for the structure of these log entries.
            *   Parameters: `step_id`, `step_name`, `agent_action`, `vm_id` (optional), `parameters` (dict), `outputs` (dict: stdout, stderr, tool_results), `agent_thoughts`, `status_update`, `is_error` (bool).
            *   Automatically adds `log_id` (UUID) and `timestamp`.
        *   `get_logs(limit=None, skip=None)`: Retrieves logs for the project, with optional pagination. Logs should be sorted by timestamp.
        *   `get_project_status_summary()`: Retrieves key information for the project status view:
            *   Overall project goal (if stored).
            *   Current overall status (e.g., running, completed, failed – likely derived from the latest significant log entry).
            *   A summary of the plan (list of steps with their individual statuses – derived by querying logs for specific step status updates).
            *   Active step ID.
            *   Associated workspace ID (if any).
            *   A few recent log entries for quick view.
    *   **Schema Enforcement (Conceptual):** While TinyDB is schema-less, the logger methods will structure the data according to the design. For more rigorous validation, a library like Pydantic could be used to define log entry models before insertion, but for now, direct dict construction will be used.

This module will provide the necessary functions for the Scout Agent to log its progress and for the API endpoints to retrieve this information.

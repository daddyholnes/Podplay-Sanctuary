import paramiko
import os
import logging
import time
import scp

logger = logging.getLogger(__name__)

# Configuration (Ideally from app config or .env)
SSH_USERNAME = os.getenv("NIXOS_VM_SSH_USER", "executor")
SSH_PRIVATE_KEY_PATH = os.getenv("NIXOS_VM_SSH_KEY_PATH", "~/.ssh/id_rsa_nixos_vm_executor") 
# Ensure this key is specific for this purpose and has restricted access.
# The public key corresponding to this private key must be in the VM's authorized_keys for the SSH_USERNAME.

class SSHExecutorError(Exception):
    pass

class SSHExecutor:
    def __init__(self, host_ip: str, port: int = 22, username: str = SSH_USERNAME, private_key_path: str = SSH_PRIVATE_KEY_PATH):
        self.host_ip = host_ip
        self.port = port
        self.username = username
        self.private_key_path = os.path.expanduser(private_key_path)
        self.client = None
        self._connect()

    def _connect(self):
        if not os.path.exists(self.private_key_path):
            msg = f"SSH private key not found at: {self.private_key_path}"
            logger.error(msg)
            raise SSHExecutorError(msg)
        
        try:
            self.client = paramiko.SSHClient()
            self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy()) # Or load known hosts
            
            pkey = paramiko.RSAKey.from_private_key_file(self.private_key_path)
            # Note: Add support for other key types like Ed25519 if needed.
            # pkey = paramiko.Ed25519Key.from_private_key_file(self.private_key_path)

            logger.info(f"Attempting SSH connection to {self.username}@{self.host_ip}:{self.port}...")
            self.client.connect(
                hostname=self.host_ip,
                port=self.port,
                username=self.username,
                pkey=pkey,
                timeout=10, # Connection timeout
                auth_timeout=10 # Authentication timeout
            )
            logger.info(f"SSH connection established to {self.host_ip}")
        except paramiko.AuthenticationException as e:
            msg = f"SSH authentication failed for {self.username}@{self.host_ip}: {e}"
            logger.error(msg)
            raise SSHExecutorError(msg)
        except paramiko.SSHException as e:
            msg = f"SSH connection error to {self.username}@{self.host_ip}: {e}"
            logger.error(msg)
            raise SSHExecutorError(msg)
        except Exception as e:
            msg = f"Unexpected error during SSH connection to {self.username}@{self.host_ip}: {e}"
            logger.error(msg, exc_info=True)
            raise SSHExecutorError(msg)

    def transfer_file(self, local_path: str, remote_path: str):
        """Transfers a single file to the remote VM using SCP."""
        if not self.client:
            raise SSHExecutorError("SSH client not connected.")
        if not os.path.exists(local_path):
            raise SSHExecutorError(f"Local file not found: {local_path}")

        try:
            logger.info(f"Transferring {local_path} to {self.host_ip}:{remote_path}...")
            with scp.SCPClient(self.client.get_transport()) as scp_client:
                scp_client.put(local_path, remote_path)
            logger.info(f"File {local_path} transferred successfully to {remote_path}.")
        except scp.SCPException as e:
            msg = f"SCP file transfer failed: {e}"
            logger.error(msg)
            raise SSHExecutorError(msg)
        except Exception as e:
            msg = f"Unexpected error during file transfer: {e}"
            logger.error(msg, exc_info=True)
            raise SSHExecutorError(msg)
            
    def retrieve_file(self, remote_path: str, local_path: str):
        """Retrieves a single file from the remote VM using SCP."""
        if not self.client:
            raise SSHExecutorError("SSH client not connected.")
        try:
            logger.info(f"Retrieving {self.host_ip}:{remote_path} to {local_path}...")
            with scp.SCPClient(self.client.get_transport()) as scp_client:
                scp_client.get(remote_path, local_path)
            logger.info(f"File {remote_path} retrieved successfully to {local_path}.")
        except scp.SCPException as e:
            # It's common for stdout/stderr log files to be empty, which can sometimes cause
            # SCP errors if the remote file is zero-length and then disappears (e.g. due to VM shutdown).
            # Check if local file was created (even if empty)
            if os.path.exists(local_path) and os.path.getsize(local_path) == 0:
                logger.warning(f"SCP retrieved an empty file from {remote_path} to {local_path}, possibly due to empty remote log. Error: {e}")
            elif not os.path.exists(local_path): # File truly not found or other SCP error
                 msg = f"SCP file retrieval failed for {remote_path}: {e}. File might not exist or be empty."
                 logger.error(msg)
                 raise SSHExecutorError(msg)
            else: # File exists and is not empty, but some other SCP error
                msg = f"SCP file retrieval warning for {remote_path}: {e}"
                logger.warning(msg)
                # Not raising an error here if file was partially retrieved and has content.
        except Exception as e:
            msg = f"Unexpected error during file retrieval: {e}"
            logger.error(msg, exc_info=True)
            raise SSHExecutorError(msg)


    def execute_command(self, command: str, timeout: int = 30) -> tuple[str, str, int]:
        """
        Executes a command on the remote VM.
        Includes a timeout for the command execution itself via paramiko's channel timeout.
        Returns (stdout, stderr, exit_status).
        """
        if not self.client:
            raise SSHExecutorError("SSH client not connected.")
        
        full_command = f"timeout --kill-after={timeout+5}s {timeout}s {command}"
        logger.info(f"Executing command on {self.host_ip}: {full_command}")
        
        try:
            # stdin, stdout, stderr are file-like objects
            # We can set a timeout on the channel for the command execution.
            # This timeout is separate from the timeout utility run on the remote host.
            # It's a safety net for the SSH channel itself.
            channel_timeout = float(timeout + 10) # थोड़ा अतिरिक्त बफर

            stdin, stdout, stderr = self.client.exec_command(full_command, timeout=channel_timeout)
            
            # Wait for the command to complete and get the exit status
            # stdout.channel.recv_exit_status() blocks until command finishes or channel closes.
            exit_status = stdout.channel.recv_exit_status() # Blocks
            
            stdout_output = stdout.read().decode('utf-8', errors='replace').strip()
            stderr_output = stderr.read().decode('utf-8', errors='replace').strip()
            
            logger.info(f"Command executed with exit status {exit_status}.")
            logger.debug(f"Stdout:\n{stdout_output}")
            logger.debug(f"Stderr:\n{stderr_output}")
            
            if exit_status == 124: # timeout utility's specific exit code for timeout
                logger.warning(f"Command '{command}' timed out on remote host (exit status 124).")
                stderr_output += "\nExecution timed out by 'timeout' utility."
            elif exit_status == 137: # Often means killed by SIGKILL (e.g. by timeout --kill-after)
                 logger.warning(f"Command '{command}' was likely killed (exit status 137), possibly by --kill-after of 'timeout'.")
                 stderr_output += "\nExecution forcefully terminated by 'timeout --kill-after'."


            return stdout_output, stderr_output, exit_status

        except paramiko.SSHException as e: # Includes channel timeout
            msg = f"SSH command execution failed or channel timed out for '{command}': {e}"
            logger.error(msg)
            # Paramiko channel timeout often results in "SSH session not active" or similar
            # if the command itself runs longer than channel_timeout.
            # The exit status in this case might not be available or reliable.
            return "", f"SSH Execution Error: {e}", -1 
        except Exception as e:
            msg = f"Unexpected error during command execution '{command}': {e}"
            logger.error(msg, exc_info=True)
            return "", f"Unexpected SSH Error: {e}", -1


    def close(self):
        if self.client:
            try:
                self.client.close()
                logger.info(f"SSH connection to {self.host_ip} closed.")
            except Exception as e:
                logger.error(f"Error closing SSH connection to {self.host_ip}: {e}")

# Example Usage (for testing this module directly)
if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)
    
    # Replace with an actual IP of a VM you can SSH into with the specified user/key
    # Ensure the VM has 'executor' user and the public key for NIXOS_VM_SSH_KEY_PATH
    # in ~executor/.ssh/authorized_keys
    # For local testing, you might use a Vagrant VM or a local libvirt VM.
    TEST_VM_IP = os.getenv("NIXOS_TEST_VM_IP") 
    
    if not TEST_VM_IP:
        logger.warning("NIXOS_TEST_VM_IP environment variable not set. Skipping direct SSHExecutor test.")
        exit(0)

    if not os.path.exists(os.path.expanduser(SSH_PRIVATE_KEY_PATH)):
        logger.error(f"Test SSH private key {SSH_PRIVATE_KEY_PATH} not found. Skipping direct SSHExecutor test.")
        exit(0)

    executor = None
    try:
        logger.info(f"Attempting to connect to test VM at {TEST_VM_IP}...")
        executor = SSHExecutor(host_ip=TEST_VM_IP)
        
        # Test file transfer
        local_test_file = "/tmp/local_test_ssh_executor.txt"
        with open(local_test_file, "w") as f:
            f.write("Hello from SSHExecutor test!\n")
        
        remote_test_file = "/tmp/remote_test_ssh_executor.txt"
        executor.transfer_file(local_test_file, remote_test_file)
        
        # Test command execution
        cmd_timeout_seconds = 5
        stdout, stderr, exit_code = executor.execute_command(f"cat {remote_test_file}; echo 'Error output on purpose' >&2; sleep 2; ls /nonexistent || true", timeout=cmd_timeout_seconds)
        logger.info(f"Test Command Output:\nSTDOUT:\n{stdout}\nSTDERR:\n{stderr}\nEXIT_CODE: {exit_code}")

        assert "Hello from SSHExecutor test!" in stdout
        assert "Error output on purpose" in stderr
        # ls /nonexistent will fail, but `|| true` makes exit code 0 if that was the last command part.
        # The structure of the test command might need adjustment based on desired exit code testing.
        # If `timeout` utility kills `sleep 2`, exit code might be 124.
        # If `ls /nonexistent` runs and then `|| true`, exit_code should be from `true` (0).
        # If the `timeout` utility kills the `sleep 2` part: exit_code will be 124.
        # The provided command is: `timeout --kill-after=10s 5s "cat /tmp/remote_test_ssh_executor.txt; echo 'Error output on purpose' >&2; sleep 2; ls /nonexistent || true"`
        # If `sleep 2` makes it exceed 5s, it will be killed.

        # Test retrieving a file
        retrieved_file_local_path = "/tmp/retrieved_remote_file.txt"
        executor.retrieve_file(remote_test_file, retrieved_file_local_path)
        with open(retrieved_file_local_path, "r") as f:
            content = f.read()
            assert "Hello from SSHExecutor test!" in content
        logger.info(f"Content of retrieved file: {content.strip()}")
        os.remove(retrieved_file_local_path)

        # Test timeout command
        logger.info("Testing command timeout...")
        # This command will definitely time out as sleep 10 > timeout 3
        stdout_timeout, stderr_timeout, exit_code_timeout = executor.execute_command("sleep 10; echo 'Should not see this'", timeout=3)
        logger.info(f"Timeout Test Command Output:\nSTDOUT:\n{stdout_timeout}\nSTDERR:\n{stderr_timeout}\nEXIT_CODE: {exit_code_timeout}")
        assert exit_code_timeout == 124 # Specific exit code from `timeout` utility
        assert "Execution timed out" in stderr_timeout

        # Clean up remote file
        executor.execute_command(f"rm {remote_test_file}")
        os.remove(local_test_file)
        
        logger.info("SSHExecutor direct tests completed successfully.")

    except SSHExecutorError as e:
        logger.error(f"SSHExecutor Error: {e}")
    except AssertionError as e:
        logger.error(f"AssertionError in tests: {e}")
    except Exception as e_global:
        logger.error(f"An unexpected error occurred in SSHExecutor test: {e_global}", exc_info=True)
    finally:
        if executor:
            executor.close()

"""
SSH Executor Module

This module provides SSH functionality for executing commands and transferring files to remote VMs.
It's designed to work with NixOS VMs and includes features like command timeouts and file transfers.

Key Features:
- SSH connection management with key-based authentication
- File transfer capabilities (upload/download)
- Command execution with timeouts
- Error handling and logging
"""

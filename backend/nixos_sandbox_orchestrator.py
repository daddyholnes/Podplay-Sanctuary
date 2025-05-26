import uuid
import logging
import time
import os
import tempfile
import paramiko
from concurrent.futures import ThreadPoolExecutor, Future
from dataclasses import dataclass, field, asdict
from typing import Dict, Optional, Any, Tuple

from .vm_manager import LibvirtManager, VMManagerError
from .ssh_executor import SSHExecutor, SSHExecutorError

logger = logging.getLogger(__name__)

# Configuration
MAX_CONCURRENT_VMS = int(os.getenv("NIXOS_MAX_CONCURRENT_VMS", "2")) # Limit concurrent VMs
VM_SSH_READY_TIMEOUT = int(os.getenv("NIXOS_VM_SSH_READY_TIMEOUT", "120")) # Seconds to wait for SSH
JOB_COMPLETION_TIMEOUT = int(os.getenv("NIXOS_JOB_COMPLETION_TIMEOUT", "300")) # Overall job timeout in orchestrator

# Job statuses
JOB_STATUS_QUEUED = "queued"
JOB_STATUS_PROVISIONING = "provisioning_vm"
JOB_STATUS_UPLOADING = "uploading_code"
JOB_STATUS_RUNNING = "running_code"
JOB_STATUS_DOWNLOADING = "downloading_results"
JOB_STATUS_COMPLETED = "completed"
JOB_STATUS_FAILED = "failed"
JOB_STATUS_VM_TIMEOUT = "vm_timeout" # VM related timeout (e.g. SSH ready)
JOB_STATUS_EXECUTION_TIMEOUT = "execution_timeout" # Code execution timeout inside VM
JOB_STATUS_ORCHESTRATION_TIMEOUT = "orchestration_timeout" # Overall job timeout

@dataclass
class JobResult:
    stdout: str = ""
    stderr: str = ""
    exit_code: int = -1
    execution_time_seconds: Optional[float] = None # Placeholder for now

@dataclass
class Job:
    id: str
    status: str
    code: str
    language: str = "python"
    requested_timeout: int = 30 # Timeout for the code execution itself
    resource_profile: str = "default" # Maps to VM resources
    submitted_at: float = field(default_factory=time.time)
    started_at: Optional[float] = None
    completed_at: Optional[float] = None
    result: Optional[JobResult] = None
    error_message: Optional[str] = None
    future: Optional[Future] = field(default=None, repr=False) # To store the Future object from ThreadPoolExecutor

    def to_dict(self):
        d = asdict(self)
        d.pop('future', None) # Don't include the Future object in dict representation
        return d

class NixOSSandboxOrchestrator:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=MAX_CONCURRENT_VMS)
        self.jobs: Dict[str, Job] = {}
        # TODO: Implement proper cleanup of old jobs from the self.jobs dict

    def _get_vm_resources(self, profile: str) -> Tuple[int, int]:
        # Simple mapping for now, could be more sophisticated
        if profile == "small":
            return 256, 1 # 256MB RAM, 1 vCPU
        elif profile == "large":
            return 1024, 2 # 1GB RAM, 2 vCPUs
        else: # default
            return 512, 1 # 512MB RAM, 1 vCPU

    def _wait_for_ssh(self, vm_ip: str, timeout: int = VM_SSH_READY_TIMEOUT) -> bool:
        logger.info(f"Waiting for SSH to be ready on {vm_ip}...")
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                # Try to establish a short-lived SSH connection
                temp_ssh = paramiko.SSHClient()
                temp_ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
                pkey_path = os.path.expanduser(os.getenv("NIXOS_VM_SSH_KEY_PATH", "~/.ssh/id_rsa_nixos_vm_executor"))
                if not os.path.exists(pkey_path): # Should not happen if SSHExecutor can init
                     logger.error(f"SSH key missing at {pkey_path} during wait_for_ssh")
                     return False
                pkey = paramiko.RSAKey.from_private_key_file(pkey_path)
                temp_ssh.connect(
                    hostname=vm_ip, port=22, username=os.getenv("NIXOS_VM_SSH_USER", "executor"),
                    pkey=pkey, timeout=5, auth_timeout=5
                )
                temp_ssh.close()
                logger.info(f"SSH is ready on {vm_ip}.")
                return True
            except Exception as e:
                logger.debug(f"SSH not ready on {vm_ip}, retrying... Error: {e}")
                time.sleep(5)
        logger.error(f"Timeout waiting for SSH on {vm_ip}.")
        return False

    def _execute_job_task(self, job_id: str):
        job = self.jobs.get(job_id)
        if not job:
            logger.error(f"Job {job_id} not found for execution.")
            return

        job.started_at = time.time()
        libvirt_manager = None
        ssh_executor = None
        domain = None
        overlay_image_path = None
        vm_ip = None
        temp_script_file = None

        try:
            job.status = JOB_STATUS_PROVISIONING
            logger.info(f"Starting job {job_id}: Provisioning VM.")
            libvirt_manager = LibvirtManager()
            
            vm_memory, vm_vcpus = self._get_vm_resources(job.resource_profile)
            domain, overlay_image_path = libvirt_manager.define_ephemeral_vm(job_id, memory_mb=vm_memory, vcpus=vm_vcpus)
            libvirt_manager.start_vm(domain)

            # Get VM IP address
            vm_ip = libvirt_manager.get_vm_ip_address(domain, timeout_seconds=VM_SSH_READY_TIMEOUT)
            if not vm_ip:
                raise VMManagerError(f"Failed to get IP address for VM {job_id} within {VM_SSH_READY_TIMEOUT}s.")

            # Wait for SSH service to be fully ready
            if not self._wait_for_ssh(vm_ip, timeout=VM_SSH_READY_TIMEOUT):
                 job.status = JOB_STATUS_VM_TIMEOUT
                 job.error_message = f"VM {job_id} did not become SSH accessible in time."
                 logger.error(job.error_message)
                 raise VMManagerError(job.error_message)

            ssh_executor = SSHExecutor(host_ip=vm_ip)

            # Create a temporary file for the code
            with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".py") as tmpf:
                tmpf.write(job.code)
                temp_script_file = tmpf.name
            
            job.status = JOB_STATUS_UPLOADING
            remote_script_path = f"/tmp/script_{job_id}.py"
            remote_stdout_path = f"/tmp/stdout_{job_id}.log"
            remote_stderr_path = f"/tmp/stderr_{job_id}.log"
            
            ssh_executor.transfer_file(temp_script_file, remote_script_path)

            job.status = JOB_STATUS_RUNNING
            # Command to execute, including redirection of stdout/stderr
            # The `timeout` utility is from coreutils in the VM.
            # Ensure exit code of python script is captured, not 'timeout' or shell.
            # `set -o pipefail` might be useful if using pipes, but here direct execution is fine.
            # The command will be: timeout T python script.py > stdout.log 2> stderr.log; echo $? > exit_code.log
            # Simpler: capture exit code from paramiko directly.
            # Timeout utility handles script timeout. SSHExecutor's command timeout is a safety net.
            # The command inside execute_command will be prefixed with "timeout <job.requested_timeout> ..."
            
            # Ensure the output files are writable by the executor user
            # This might require `chown executor /tmp/*_{job_id}.log` or ensuring /tmp is world-writable for new files by executor.
            # For simplicity, assume /tmp is fine.
            
            # The SSHExecutor.execute_command already prepends the `timeout` utility.
            # We pass job.requested_timeout to it.
            full_command_to_run = f"python3 {remote_script_path} > {remote_stdout_path} 2> {remote_stderr_path}"
            
            logger.info(f"Job {job_id}: Executing code in VM. Command: {full_command_to_run} with timeout {job.requested_timeout}s")
            
            # The execute_command in SSHExecutor handles the actual "timeout" prefix for the command.
            # The job.requested_timeout is for the script itself.
            # The SSHExecutor's own channel timeout is a bit longer.
            _stdout_exec, _stderr_exec, exit_status_exec = ssh_executor.execute_command(
                full_command_to_run, 
                timeout=job.requested_timeout 
            )
            # Note: _stdout_exec and _stderr_exec here are from the SSH command itself (e.g. if timeout command fails to run),
            # not the script's stdout/stderr which are redirected to files.

            job.status = JOB_STATUS_DOWNLOADING
            
            # Create local temp files to download to
            local_stdout_file = tempfile.NamedTemporaryFile(delete=False).name
            local_stderr_file = tempfile.NamedTemporaryFile(delete=False).name

            try:
                ssh_executor.retrieve_file(remote_stdout_path, local_stdout_file)
                with open(local_stdout_file, "r") as f:
                    job_stdout = f.read()
            except Exception as e_stdout:
                logger.warning(f"Job {job_id}: Could not retrieve or read stdout file {remote_stdout_path}: {e_stdout}")
                job_stdout = "" # Default to empty if retrieval fails
                if _stderr_exec: # Append any direct stderr from exec_command
                    _stderr_exec += f"\nWarning: Failed to retrieve stdout log from VM: {e_stdout}"


            try:
                ssh_executor.retrieve_file(remote_stderr_path, local_stderr_file)
                with open(local_stderr_file, "r") as f:
                    job_stderr = f.read()
            except Exception as e_stderr:
                logger.warning(f"Job {job_id}: Could not retrieve or read stderr file {remote_stderr_path}: {e_stderr}")
                job_stderr = _stderr_exec # Use stderr from exec_command if file retrieval fails
                job_stderr += f"\nWarning: Failed to retrieve stderr log from VM: {e_stderr}"
            
            if _stderr_exec and _stderr_exec not in job_stderr: # Append if not already part of it
                job_stderr = f"{_stderr_exec}\n{job_stderr}".strip()


            job.result = JobResult(stdout=job_stdout, stderr=job_stderr, exit_code=exit_status_exec)
            job.status = JOB_STATUS_COMPLETED
            
            if exit_status_exec == 124: # From timeout utility
                job.status = JOB_STATUS_EXECUTION_TIMEOUT
                job.error_message = "Code execution timed out inside the VM."
                job.result.stderr = (job.result.stderr + "\n" + job.error_message).strip()


            logger.info(f"Job {job_id} completed. Status: {job.status}, Exit Code: {exit_status_exec}")

        except VMManagerError as e:
            logger.error(f"Job {job_id} failed due to VMManagerError: {e}", exc_info=True)
            job.status = JOB_STATUS_FAILED
            job.error_message = f"VM Error: {e}"
        except SSHExecutorError as e:
            logger.error(f"Job {job_id} failed due to SSHExecutorError: {e}", exc_info=True)
            job.status = JOB_STATUS_FAILED
            job.error_message = f"SSH Error: {e}"
        except Exception as e:
            logger.error(f"Job {job_id} failed unexpectedly: {e}", exc_info=True)
            job.status = JOB_STATUS_FAILED
            job.error_message = f"Unexpected Orchestrator Error: {e}"
        finally:
            if temp_script_file and os.path.exists(temp_script_file):
                os.remove(temp_script_file)
            if 'local_stdout_file' in locals() and os.path.exists(local_stdout_file):
                os.remove(local_stdout_file)
            if 'local_stderr_file' in locals() and os.path.exists(local_stderr_file):
                os.remove(local_stderr_file)

            if libvirt_manager and domain and overlay_image_path:
                logger.info(f"Job {job_id}: Cleaning up VM resources.")
                libvirt_manager.cleanup_ephemeral_vm_resources(domain, overlay_image_path)
            if libvirt_manager:
                libvirt_manager.close_connection()
            if ssh_executor:
                ssh_executor.close()
            
            job.completed_at = time.time()
            logger.info(f"Job {job_id} finished processing. Final status: {job.status}")


    def submit_execution_job(self, code: str, language: str = "python", timeout: int = 30, resource_profile: str = "default") -> str:
        job_id = str(uuid.uuid4())
        job = Job(
            id=job_id, 
            status=JOB_STATUS_QUEUED, 
            code=code, 
            language=language,
            requested_timeout=timeout,
            resource_profile=resource_profile
        )
        self.jobs[job_id] = job
        
        try:
            future = self.executor.submit(self._execute_job_task, job_id)
            job.future = future # Store future for potential cancellation/timeout by orchestrator
        except Exception as e:
            logger.error(f"Failed to submit job {job_id} to executor: {e}")
            job.status = JOB_STATUS_FAILED
            job.error_message = "Failed to queue job for execution."
            job.completed_at = time.time()

        logger.info(f"Job {job_id} submitted. Requested timeout: {timeout}s, Profile: {resource_profile}")
        return job_id

    def get_job_details(self, job_id: str) -> Optional[Dict[str, Any]]:
        job = self.jobs.get(job_id)
        if job:
            # Check if orchestrator-level timeout occurred for a job that's still 'running'
            # This is a basic check; more sophisticated would involve checking job.future.done() or timeouts
            if job.status not in [JOB_STATUS_COMPLETED, JOB_STATUS_FAILED, JOB_STATUS_EXECUTION_TIMEOUT, JOB_STATUS_VM_TIMEOUT, JOB_STATUS_ORCHESTRATION_TIMEOUT] \
               and job.started_at and (time.time() - job.started_at > JOB_COMPLETION_TIMEOUT):
                job.status = JOB_STATUS_ORCHESTRATION_TIMEOUT
                job.error_message = f"Job exceeded orchestrator's max processing time of {JOB_COMPLETION_TIMEOUT}s."
                job.completed_at = time.time()
                logger.warning(f"Job {job_id} marked as timed out by orchestrator.")

            return job.to_dict()
        return None

    def get_job_status(self, job_id: str) -> Optional[str]:
        """Get just the status of a job"""
        job = self.jobs.get(job_id)
        if job:
            return job.status
        return None

    def shutdown(self):
        logger.info("Shutting down NixOS Sandbox Orchestrator ThreadPoolExecutor...")
        self.executor.shutdown(wait=True)
        logger.info("ThreadPoolExecutor shut down.")

# Example usage (for testing this module directly)
# Note: This direct test requires libvirtd to be running and configured,
# a base NixOS qcow2 image, and proper SSH key setup.
if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    orchestrator = NixOSSandboxOrchestrator()

    test_code_simple = "print('Hello from NixOS sandbox!')\nimport time\ntime.sleep(2)\nprint('Done sleeping.')"
    test_code_error = "print('About to error')\nimport sys\nsys.exit(5)"
    test_code_timeout_internal = "print('Starting long sleep...')\nimport time\ntime.sleep(20)\nprint('This should not appear due to timeout')"

    job_id_simple = orchestrator.submit_execution_job(test_code_simple, timeout=10)
    job_id_error = orchestrator.submit_execution_job(test_code_error, timeout=5)
    job_id_timeout = orchestrator.submit_execution_job(test_code_timeout_internal, timeout=3) # Script timeout is 3s

    logger.info(f"Submitted jobs: Simple ({job_id_simple}), Error ({job_id_error}), Timeout ({job_id_timeout})")

    # Poll for results (simplified polling loop)
    for i in range(45): # Poll for up to 45 seconds
        time.sleep(5)
        print(f"\nPolling at T+{i*5+5}s...")
        for j_id in [job_id_simple, job_id_error, job_id_timeout]:
            details = orchestrator.get_job_details(j_id)
            if details:
                print(f"Job {j_id} Status: {details['status']}")
                if details['status'] in [JOB_STATUS_COMPLETED, JOB_STATUS_FAILED, JOB_STATUS_EXECUTION_TIMEOUT, JOB_STATUS_VM_TIMEOUT, JOB_STATUS_ORCHESTRATION_TIMEOUT]:
                    print(f"  Result for {j_id}:")
                    print(f"    STDOUT: {details.get('result', {}).get('stdout', 'N/A')[:200]}") # Print first 200 chars
                    print(f"    STDERR: {details.get('result', {}).get('stderr', 'N/A')[:200]}")
                    print(f"    EXIT_CODE: {details.get('result', {}).get('exit_code', 'N/A')}")
                    if details.get('error_message'):
                         print(f"    ERROR_MSG: {details['error_message']}")
            else:
                print(f"Job {j_id} not found (should not happen).")
        
        # Check if all test jobs are done
        if all(orchestrator.get_job_details(j_id)['status'] in [JOB_STATUS_COMPLETED, JOB_STATUS_FAILED, JOB_STATUS_EXECUTION_TIMEOUT, JOB_STATUS_VM_TIMEOUT, JOB_STATUS_ORCHESTRATION_TIMEOUT] for j_id in [job_id_simple, job_id_error, job_id_timeout]):
            print("\nAll test jobs have reached a final state.")
            break
    
    orchestrator.shutdown()
    logger.info("Orchestrator shutdown complete.")

# 
# Explanation of nixos_sandbox_orchestrator.py:
#
# - JobResult and Job Dataclasses: Define structures for storing job results and job metadata, 
#   including status, timestamps, and the Future object from the thread pool.
# - NixOSSandboxOrchestrator Class:
#   - __init__: Initializes a ThreadPoolExecutor with MAX_CONCURRENT_VMS and an in-memory 
#     dictionary self.jobs to store job states.
#   - _get_vm_resources: Simple helper to map resource profile names to memory/vCPU configurations.
#   - _wait_for_ssh: Polls the VM's IP address to check for SSH readiness before attempting to connect. 
#     Uses paramiko for a quick connection test.
#   - _execute_job_task: This is the main worker function executed by the thread pool for each job.
#     1. Provisioning: Initializes LibvirtManager, defines and starts a VM. Retrieves the VM's IP address.
#     2. SSH Ready Wait: Calls _wait_for_ssh.
#     3. Code Upload: Initializes SSHExecutor. Creates a local temporary file with the user's code, 
#        then uses ssh_executor.transfer_file to upload it to /tmp/ in the VM.
#     4. Execution: Constructs the command to run the Python script, redirecting its stdout and stderr 
#        to files within the VM (/tmp/stdout_{job_id}.log, /tmp/stderr_{job_id}.log). It then calls 
#        ssh_executor.execute_command, which internally prepends the timeout utility to the script 
#        execution part. The job.requested_timeout is passed to ssh_executor.execute_command.
#     5. Result Download: Retrieves the content of the remote stdout and stderr log files using 
#        ssh_executor.retrieve_file. Handles potential errors during retrieval (e.g., if files are 
#        empty or not found).
#     6. Status Update: Updates the Job object with the results (stdout, stderr, exit code) and sets 
#        the status to COMPLETED, EXECUTION_TIMEOUT (if exit code 124 from timeout utility), or FAILED.
#     7. Cleanup: In a finally block, it ensures local temporary files are deleted, and VM resources 
#        (libvirt domain, overlay image) are cleaned up using libvirt_manager.cleanup_ephemeral_vm_resources. 
#        SSH and libvirt connections are closed.
#   - submit_execution_job:
#     - Creates a new Job object with a unique ID and "queued" status.
#     - Stores the job in self.jobs.
#     - Submits _execute_job_task to the ThreadPoolExecutor.
#     - Returns the job ID.
#   - get_job_details: Retrieves the current state of a job. Includes a basic check for overall 
#     job timeout at the orchestrator level.
#   - shutdown: Shuts down the ThreadPoolExecutor.
# - Example Usage (if __name__ == '__main__'):
#   - Demonstrates submitting a few test jobs (simple print, script with an error, script designed 
#     to time out) and polls their status.
#   - Requires a proper libvirt setup, base NixOS image, and SSH keys configured for this direct 
#     test to run successfully. It's more of an integration test for the orchestrator itself.
#
# Next Steps:
#
# 1. Integrate into app.py:
#    - Create an instance of NixOSSandboxOrchestrator when the Flask app starts.
#    - Implement the POST /api/v1/execute_python_nixos endpoint to call orchestrator.submit_execution_job().
#    - Implement the GET /api/v1/execution_result/{job_id} endpoint to call orchestrator.get_job_details().
#    - Ensure graceful shutdown of the orchestrator when the Flask app exits.
# 2. Configuration in app.py: Ensure environment variables used by vm_manager, ssh_executor, and 
#    nixos_sandbox_orchestrator are loaded (e.g., via python-dotenv).
# 3. Dependencies: Add libvirt-python, paramiko, scp to requirements.txt.
#
# This module provides the asynchronous job management layer. The main challenge during testing this 
# directly (or via the Flask app later) will be ensuring the host environment has libvirt working, 
# QEMU installed, the necessary base NixOS image, and correctly configured SSH keys for the VMs. 
# The error handling within _execute_job_task aims to catch issues at various stages and update the 
# job status accordingly.
#
# Okay, the foundational modules (vm_manager.py, ssh_executor.py, nixos_sandbox_orchestrator.py) are 
# now in place. The final step is to integrate this into the Flask application (backend/app.py) by 
# adding the new API endpoints and managing the orchestrator instance.
#
# Plan for app.py modifications:
#
# 1. Import necessary modules: NixOSSandboxOrchestrator and related components.
# 2. Initialize Orchestrator: Create a global instance of NixOSSandboxOrchestrator.
# 3. Implement POST /api/v1/execute_python_nixos endpoint:
#    - Get code, language, timeout_seconds, resource_profile from the JSON request body.
#    - Perform basic input validation.
#    - Call orchestrator.submit_execution_job() with the provided parameters.
#    - Return a 202 Accepted response with the job_id.
# 4. Implement GET /api/v1/execution_result/{job_id} endpoint:
#    - Call orchestrator.get_job_details(job_id).
#    - Return the job details as JSON. If the job is not found, return a 404.
# 5. Graceful Shutdown (Optional but Recommended):
#    - Use atexit or Flask's teardown mechanisms to call orchestrator.shutdown() when the Flask 
#      application exits, ensuring the thread pool is cleaned up. This is important for a clean shutdown.
# 6. Configuration: Ensure that environment variables used by the new modules (e.g., NIXOS_SANDBOX_BASE_IMAGE, 
#    NIXOS_VM_SSH_USER, NIXOS_VM_SSH_KEY_PATH, MAX_CONCURRENT_VMS) are loaded and respected. The existing 
#    .env loading mechanism should cover this.
#
# This will complete the primary implementation path. Testing will require a fully configured libvirt 
# environment with the NixOS base image and SSH keys.
#
# Let's proceed with modifying app.py.

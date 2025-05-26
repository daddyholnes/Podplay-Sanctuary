import unittest
from unittest.mock import patch, MagicMock, AsyncMock, call
import os
import sys
import json
import asyncio # For async tests

# Add backend to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from cloud_dev_sandbox import AgenticDevSandbox
# Import MamaBearTaskType for testing calls
try:
    from unified_mama_bear import MamaBearTaskType
except ImportError:
    MamaBearTaskType = None # Placeholder if import fails during testing setup

# Helper to run async tests if needed (though unittest.IsolatedAsyncioTestCase is better for Python 3.8+)
def async_test(coro):
    def wrapper(*args, **kwargs):
        loop = asyncio.new_event_loop()
        try:
            asyncio.set_event_loop(loop)
            return loop.run_until_complete(coro(*args, **kwargs))
        finally:
            loop.close()
            asyncio.set_event_loop(None)
    return wrapper

class TestAgenticDevSandbox(unittest.TestCase):

    @patch.dict(os.environ, {
        "MEM0_API_KEY": "fake_mem0_key", # For UnifiedMamaBearAgent if it's not fully mocked
        "TOGETHER_API_KEY": "fake_together_key",
        "GOOGLE_CLOUD_PROJECT": "fake_project",
        "GOOGLE_CLOUD_LOCATION": "fake_location",
        "NIXOS_VM_SSH_USER": "testuser",
        "NIXOS_VM_SSH_KEY_PATH": "/fake/path/to/key"
    })
    @patch('cloud_dev_sandbox.UnifiedMamaBearAgent')
    @patch('cloud_dev_sandbox.Mem0ChatManager')
    @patch('cloud_dev_sandbox.NixOSSandboxOrchestrator')
    @patch('cloud_dev_sandbox.LibvirtManager')
    @patch('cloud_dev_sandbox.CloudDevSandboxManager') # This is defined in the same file, tricky to mock this way
    @patch('cloud_dev_sandbox.ScoutLogManager')
    def setUp(self, MockScoutLogManager, MockCloudDevSandboxManager, MockLibvirtManager, MockNixOSOrchestrator, MockMem0ChatManager, MockUnifiedMamaBearAgent):
        
        # Mock instances for AgenticDevSandbox dependencies
        self.mock_mama_bear_agent = MockUnifiedMamaBearAgent.return_value
        self.mock_mem0_chat_manager = MockMem0ChatManager.return_value
        self.mock_nixos_orchestrator = MockNixOSOrchestrator.return_value
        self.mock_vm_manager = MockLibvirtManager.return_value
        
        # For CloudDevSandboxManager, since it's in the same module, 
        # we might need to patch it where it's instantiated if the class-level patch doesn't work as expected.
        # Or, rely on the fact that its methods will be called on an instance of the actual class,
        # and then mock those specific methods if needed for some tests.
        # For now, let's assume the class-level mock works for its instantiation within AgenticDevSandbox.
        self.mock_cloud_sandbox_manager_instance = MockCloudDevSandboxManager.return_value
        
        self.mock_scout_log_manager = MockScoutLogManager.return_value
        self.mock_project_logger = MagicMock()
        self.mock_scout_log_manager.get_project_logger.return_value = self.mock_project_logger

        # Instantiate AgenticDevSandbox
        # It will try to initialize its own CloudDevSandboxManager, which should pick up the mock.
        self.sandbox = AgenticDevSandbox(user_id="test_sandbox_user")
        # Override the cloud_sandbox_manager if the class-level patch didn't catch the internal instantiation properly
        self.sandbox.cloud_sandbox_manager = self.mock_cloud_sandbox_manager_instance


    @async_test
    async def test_plan_project_success(self):
        mock_plan_json = json.dumps({
            "plan": [{"step_id": 1, "description": "Do this", "tools_required": [], "status": "pending", "deliverables": "Done"}]
        })
        self.mock_mama_bear_agent.vertex_ai_chat.return_value = mock_plan_json
        
        result = await self.sandbox.plan_project("Create a simple web app", project_logger=self.mock_project_logger)
        
        self.assertTrue(result["success"])
        self.assertEqual(len(result["plan"]), 1)
        self.assertEqual(result["plan"][0]["description"], "Do this")
        
        # Assert that vertex_ai_chat was called with the correct task_type
        self.mock_mama_bear_agent.vertex_ai_chat.assert_called_once_with(
            unittest.mock.ANY, # For the prompt string
            task_type=MamaBearTaskType.PLANNING
        )
        self.mock_project_logger.log_entry.assert_any_call(agent_action="plan_project_start", inputs={"prompt": "Create a simple web app"})


    @async_test
    async def test_plan_project_malformed_json(self):
        self.mock_mama_bear_agent.vertex_ai_chat.return_value = "This is not JSON"
        result = await self.sandbox.plan_project("Test prompt", project_logger=self.mock_project_logger)
        self.assertFalse(result["success"])
        self.assertIn("JSON parsing failed", result["error"])
        # Ensure it was still called with the PLANING task type
        self.mock_mama_bear_agent.vertex_ai_chat.assert_called_with(
            unittest.mock.ANY,
            task_type=MamaBearTaskType.PLANNING
        )

    @async_test
    async def test_provision_environment_nixos_success(self):
        self.mock_vm_manager.define_workspace_vm.return_value = (MagicMock(name="domain_obj", UUIDString=lambda: "fake-uuid"), "/path/to/disk.qcow2")
        self.mock_vm_manager.get_vm_ip_address.return_value = "192.168.1.100"
        
        project_id = "proj_nixos_test"
        requirements = {"os": "nixos"}
        result = await self.sandbox.provision_environment(project_id, "nixos", requirements, project_logger=self.mock_project_logger)
        
        self.assertTrue(result["success"])
        self.assertEqual(result["environment_details"]["type"], "nixos_persistent")
        self.assertEqual(result["environment_details"]["ip_address"], "192.168.1.100")
        self.mock_vm_manager.define_workspace_vm.assert_called_once_with(workspace_id=project_id, memory_mb=1024, vcpus=2)
        self.mock_vm_manager.start_vm.assert_called_once()
        self.mock_vm_manager.get_vm_ip_address.assert_called_once()
        self.mock_project_logger.log_entry.assert_any_call(agent_action="provision_environment_start", inputs=unittest.mock.ANY)


    @async_test
    async def test_provision_environment_cloud_success(self):
        self.mock_cloud_sandbox_manager_instance.create_environment = AsyncMock(
            return_value={"success": True, "environment": {"id": "cloud_env_1", "type": "node", "status": "running", "url": "http://example.com"}}
        )
        
        project_id = "proj_cloud_test"
        requirements = {"type": "node"}
        result = await self.sandbox.provision_environment(project_id, "cloud", requirements, project_logger=self.mock_project_logger)
        
        self.assertTrue(result["success"])
        self.assertEqual(result["environment_details"]["type"], "cloud")
        self.assertEqual(result["environment_details"]["provider_details"]["id"], "cloud_env_1")
        self.mock_cloud_sandbox_manager_instance.create_environment.assert_called_once()


    @patch('cloud_dev_sandbox.SSHExecutor')
    @async_test
    async def test_install_tool_in_environment_nixos_pip(self, MockSSHExecutor):
        mock_ssh_instance = MockSSHExecutor.return_value
        mock_ssh_instance.execute_command.return_value = ("Successfully installed", "", 0) # stdout, stderr, exit_code
        
        tool_details = {"name": "my-tool", "package_name": "my-tool-package", "installation_method": "pip"}
        env_context = {
            "type": "nixos_persistent", "env_id": "nixos_vm1", 
            "ip_address": "1.2.3.4", "ssh_user": "test", "ssh_key_path": "/key.pem"
        }
        
        success = await self.sandbox.install_tool_in_environment(tool_details, env_context, project_logger=self.mock_project_logger)
        
        self.assertTrue(success)
        mock_ssh_instance.execute_command.assert_called_once_with("pip3 install my-tool-package", timeout=300)
        mock_ssh_instance.close.assert_called_once()


    @async_test
    async def test_install_tool_in_environment_cloud(self):
        tool_details = {"name": "cloud-tool", "installation_method": "npm"}
        env_context = {"type": "cloud", "env_id": "cloud_env1"}
        
        success = await self.sandbox.install_tool_in_environment(tool_details, env_context, project_logger=self.mock_project_logger)
        self.assertTrue(success) # Cloud simulation always returns true for now
        self.mock_project_logger.log_entry.assert_any_call(
            agent_action="install_tool_result", 
            inputs=unittest.mock.ANY, 
            outputs=unittest.mock.ANY # Check for success: True and the simulation message
        )

    @patch('cloud_dev_sandbox.SSHExecutor')
    @async_test
    async def test_run_tests_in_environment_nixos(self, MockSSHExecutor):
        mock_ssh_instance = MockSSHExecutor.return_value
        mock_ssh_instance.execute_command.return_value = ("All tests passed!", "", 0)
        
        project_context = {
            "provisioned_environment": {"type": "nixos_persistent", "env_id": "vm1", "ip_address": "1.2.3.4", "ssh_user": "test", "ssh_key_path": "/key.pem"},
            "project_logger": self.mock_project_logger,
            "project_id": "proj_test_run"
        }
        test_cmd = "pytest tests/"
        result = await self.sandbox.run_tests_in_environment(project_context, test_command=test_cmd)
        
        self.assertTrue(result["success"])
        self.assertEqual(result["stdout"], "All tests passed!")
        mock_ssh_instance.execute_command.assert_called_once_with(f"cd /app && {test_cmd}", timeout=600)

    @patch('cloud_dev_sandbox.SSHExecutor')
    @async_test
    async def test_capture_output_preview_nixos(self, MockSSHExecutor):
        mock_ssh_instance = MockSSHExecutor.return_value
        mock_ssh_instance.execute_command.return_value = ("Current directory listing...", "", 0)

        project_context = {
            "provisioned_environment": {"type": "nixos_persistent", "env_id": "vm1", "ip_address": "1.2.3.4", "ssh_user": "test", "ssh_key_path": "/key.pem"},
            "project_logger": self.mock_project_logger,
            "project_id": "proj_output_cap"
        }
        cmd_to_capture = "ls -l"
        result = await self.sandbox.capture_output_preview(project_context, command_to_capture=cmd_to_capture)

        self.assertTrue(result["success"])
        self.assertEqual(result["stdout"], "Current directory listing...")
        mock_ssh_instance.execute_command.assert_called_once_with(f"cd /app && {cmd_to_capture}", timeout=60)


    @async_test
    async def test_manage_project_workflow_orchestration(self):
        # Mock the main methods of the workflow
        self.sandbox.provision_environment = AsyncMock(return_value={
            "success": True, 
            "environment_details": {"env_id": "env123", "type": "cloud", "status": "ready"}
        })
        self.sandbox.plan_project = AsyncMock(return_value={
            "success": True, 
            "plan": [{"step_id": 1, "description": "Step 1", "tools_required": [], "status": "pending", "deliverables": "Output1"}]
        })
        self.sandbox.execute_project_step = AsyncMock(return_value={"success": True, "step_id": 1, "status": "completed", "message": "Step 1 done"})

        high_level_prompt = "Develop a full-stack app"
        result = await self.sandbox.manage_project_workflow(high_level_prompt, project_id="workflow_test_project")
        
        self.assertTrue(result["success"])
        self.sandbox.provision_environment.assert_called_once()
        self.sandbox.plan_project.assert_called_once()
        self.sandbox.execute_project_step.assert_called_once()
        
        # Check if project logger was used (assuming it's obtained within manage_project_workflow)
        self.mock_scout_log_manager.get_project_logger.assert_called_with("workflow_test_project")
        self.mock_project_logger.set_project_goal.assert_called_with(high_level_prompt)
        self.mock_project_logger.set_overall_status.assert_any_call("starting")
        self.mock_project_logger.set_overall_status.assert_any_call("completed_successfully")

    @async_test
    async def test_get_intelligent_assistance_task_type(self):
        # Test that get_intelligent_assistance passes the correct task type
        self.mock_mama_bear_agent.vertex_ai_chat.return_value = "Assistance response"
        
        # Test with a query suggesting coding
        await self.sandbox.get_intelligent_assistance(environment_context={}, user_query="Write some code to do X")
        self.mock_mama_bear_agent.vertex_ai_chat.assert_called_with(
            unittest.mock.ANY, # Prompt
            task_type=MamaBearTaskType.CODING 
        )
        self.mock_mama_bear_agent.vertex_ai_chat.reset_mock()

        # Test with a query suggesting summarization
        await self.sandbox.get_intelligent_assistance(environment_context={}, user_query="Summarize this document")
        self.mock_mama_bear_agent.vertex_ai_chat.assert_called_with(
            unittest.mock.ANY, # Prompt
            task_type=MamaBearTaskType.SUMMARIZING
        )
        self.mock_mama_bear_agent.vertex_ai_chat.reset_mock()

        # Test with a general query
        await self.sandbox.get_intelligent_assistance(environment_context={}, user_query="What is the weather?")
        self.mock_mama_bear_agent.vertex_ai_chat.assert_called_with(
            unittest.mock.ANY, # Prompt
            task_type=MamaBearTaskType.GENERAL_REASONING
        )


    @patch('cloud_dev_sandbox.SSHExecutor')
    @async_test
    async def test_execute_project_step_with_tool_install_and_rag(self, MockSSHExecutor):
        # Setup for tool installation failure
        mock_ssh_instance = MockSSHExecutor.return_value
        mock_ssh_instance.execute_command.return_value = ("Install failed", "Error output", 1) # Simulates install failure
        
        # Mock MCP Marketplace search
        self.mock_mama_bear_agent.mcp_marketplace_manager.search_servers.return_value = [
            {"name": "test-tool", "package_name": "test-package", "installation_method": "pip"}
        ]
        # Mock RAG suggestion
        self.mock_mama_bear_agent.self_debug_with_rag.return_value = "Try installing with sudo."

        step_details = {"step_id": "s1", "description": "Install and use tool", "tools_required": ["test-tool"]}
        project_context = {
            "provisioned_environment": {"type": "nixos_persistent", "env_id": "vm_rag_test", "ip_address": "1.2.3.4", "ssh_user": "test", "ssh_key_path": "/key.pem"},
            "project_logger": self.mock_project_logger,
            "project_id": "proj_rag_test"
        }
        
        result = await self.sandbox.execute_project_step(step_details, project_context)
        
        self.assertFalse(result["success"]) # Should fail because tool install failed
        self.assertIn("Failed to install tool: test-tool", result["message"])
        
        self.mock_mama_bear_agent.mcp_marketplace_manager.search_servers.assert_called_with(query="test-tool")
        MockSSHExecutor.return_value.execute_command.assert_called_with("pip3 install test-package", timeout=300)
        self.mock_mama_bear_agent.self_debug_with_rag.assert_called_once()
        # Check that RAG suggestion was logged
        self.mock_project_logger.log_entry.assert_any_call(
            agent_action="rag_suggestion_tool_install",
            inputs=unittest.mock.ANY,
            outputs={"suggestion": "Try installing with sudo."}
        )

if __name__ == '__main__':
    unittest.main()

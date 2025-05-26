import unittest
from unittest.mock import patch, MagicMock, mock_open
import os
import sys

# Add backend to sys.path to allow direct import of backend modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from unified_mama_bear import UnifiedMamaBearAgent, MamaBearTaskType, GEMINI_FLASH_MODEL, GEMINI_PRO_MODEL

class TestUnifiedMamaBearAgent(unittest.TestCase):

    @patch.dict(os.environ, {
        "MEM0_API_KEY": "fake_mem0_key",
        "TOGETHER_API_KEY": "fake_together_key",
        "GOOGLE_CLOUD_PROJECT": "fake_project",
        "GOOGLE_CLOUD_LOCATION": "fake_location",
    })
    @patch('unified_mama_bear.SanctuaryDB')
    @patch('unified_mama_bear.MCPMarketplaceManager')
    @patch('unified_mama_bear.Memory') 
    @patch('unified_mama_bear.Together')
    @patch('unified_mama_bear.aiplatform') 
    @patch('unified_mama_bear.GenerativeModel') # This is the class we want to mock
    def setUp(self, MockGenerativeModelClass, MockAiplatform, MockTogether, MockMem0, MockMCPMarketplaceManager, MockSanctuaryDB):
        # Mock instances
        self.mock_db = MockSanctuaryDB.return_value
        self.mock_mcp_manager = MockMCPMarketplaceManager.return_value
        self.mock_memory = MockMem0.return_value
        self.mock_together_client = MockTogether.return_value
        
        # Mock for the GenerativeModel class itself, to check how it's instantiated
        self.MockGenerativeModelClass = MockGenerativeModelClass
        # The instance returned by GenerativeModel(model_name)
        self.mock_model_instance = self.MockGenerativeModelClass.return_value 
        # Mock the response from generate_content()
        self.mock_model_instance.generate_content.return_value = MagicMock(text="Default mock response")

        # Mock the chat session if start_new_vertex_chat_session is tested more deeply
        self.mock_chat_session = MagicMock() # This is for the start_chat() method of a model instance
        self.mock_model_instance.start_chat.return_value = self.mock_chat_session
        
        # Instantiate the agent
        self.agent = UnifiedMamaBearAgent(user_id="test_user", db_path=":memory:")
        # Reset GenerativeModelClass mock after agent's __init__ might have called it for default model check
        self.MockGenerativeModelClass.reset_mock()
        # Re-assign the instance that will be returned by calls to GenerativeModel() in tests
        self.MockGenerativeModelClass.return_value = self.mock_model_instance


    def test_initialization_all_services_available(self):
        # Test that essential non-Vertex components are initialized
        self.assertIsNotNone(self.agent.db)
        self.assertIsNotNone(self.agent.mcp_marketplace_manager)
        self.assertIsNotNone(self.agent.memory)
        self.assertIsNotNone(self.agent.together_client)
        # Vertex AI model/chat_session are now created on demand.
        # Check that configuration for Vertex AI is present.
        self.assertTrue(self.agent.google_cloud_project == "fake_project")
        self.assertEqual(self.agent.default_vertex_model_name, GEMINI_FLASH_MODEL)


    @patch.dict(os.environ, {}, clear=True) 
    @patch('unified_mama_bear.SanctuaryDB') 
    @patch('unified_mama_bear.MCPMarketplaceManager')
    # We need to control GenerativeModel for this specific test too
    @patch('unified_mama_bear.GenerativeModel')
    def test_initialization_no_api_keys_some_services(self, MockScopedGenerativeModel, MockMCP, MockDB):
        # Test for missing GCP keys
        with patch.dict(os.environ, {"GOOGLE_CLOUD_PROJECT": "", "GOOGLE_CLOUD_LOCATION": ""}, clear=True):
            os.environ["MEM0_API_KEY"] = "fake_mem0_key" 
            agent_no_gcp = UnifiedMamaBearAgent(user_id="test_user_no_gcp", db_path=":memory:")
            self.assertIsNone(agent_no_gcp.vertex_ai_model) 
            self.assertIsNone(agent_no_gcp.chat_session) 
            self.assertEqual(agent_no_gcp.google_cloud_project, "")

        # Test for missing MEM0_API_KEY
        with patch.dict(os.environ, {"MEM0_API_KEY": ""}, clear=True):
            os.environ["GOOGLE_CLOUD_PROJECT"] = "fake_project"
            os.environ["GOOGLE_CLOUD_LOCATION"] = "fake_location"
            agent_no_mem0 = UnifiedMamaBearAgent(user_id="test_user_no_mem0", db_path=":memory:")
            self.assertIsNone(agent_no_mem0.memory)


    def test_store_memory_success(self):
        self.mock_memory.add.return_value = "memory_id_123" 
        result = self.agent.store_memory("Test data to store")
        self.mock_memory.add.assert_called_once_with("Test data to store", user_id="test_user", metadata={"agent_id": "UnifiedMamaBearAgent"})
        self.assertEqual(result, "memory_id_123")

    def test_store_memory_no_client(self): 
        self.agent.memory = None 
        result = self.agent.store_memory("Test data")
        self.assertIsNone(result)
        self.mock_memory.add.assert_not_called() 

    def test_search_memory_success(self): 
        mock_search_results = [{"text": "result1"}, {"text": "result2"}]
        self.mock_memory.search.return_value = mock_search_results
        results = self.agent.search_memory("Test query")
        self.mock_memory.search.assert_called_once_with("Test query", user_id="test_user")
        self.assertEqual(results, mock_search_results)

    def test_search_memory_no_client(self): 
        self.agent.memory = None
        results = self.agent.search_memory("Test query")
        self.assertEqual(results, [])
        self.mock_memory.search.assert_not_called()
        
    def test_get_all_memories_success(self): 
        mock_all_memories = [{"id": "mem1", "text": "memory one"}, {"id": "mem2", "text": "memory two"}]
        self.mock_memory.get_all.return_value = mock_all_memories
        results = self.agent.get_all_memories()
        self.mock_memory.get_all.assert_called_once_with(user_id="test_user")
        self.assertEqual(results, mock_all_memories)

    def test_delete_memory_success(self): 
        self.agent.delete_memory("memory_id_to_delete")
        self.mock_memory.delete.assert_called_once_with(memory_id="memory_id_to_delete")


    def test_choose_gemini_model(self):
        self.assertEqual(self.agent._choose_gemini_model(MamaBearTaskType.PLANNING), GEMINI_FLASH_MODEL)
        self.assertEqual(self.agent._choose_gemini_model(MamaBearTaskType.SUMMARIZING), GEMINI_FLASH_MODEL)
        self.assertEqual(self.agent._choose_gemini_model(MamaBearTaskType.DEFAULT), GEMINI_FLASH_MODEL)
        
        self.assertEqual(self.agent._choose_gemini_model(MamaBearTaskType.CODING), GEMINI_PRO_MODEL)
        self.assertEqual(self.agent._choose_gemini_model(MamaBearTaskType.GENERAL_REASONING), GEMINI_PRO_MODEL)
        self.assertEqual(self.agent._choose_gemini_model(MamaBearTaskType.RAG_ASSISTED_DEBUGGING), GEMINI_PRO_MODEL)

        # Test fallback by temporarily removing a preferred model from available_vertex_models
        original_available_models = self.agent.available_vertex_models
        self.agent.available_vertex_models = {GEMINI_FLASH_MODEL: self.agent.available_vertex_models[GEMINI_FLASH_MODEL]} 
        self.assertEqual(self.agent._choose_gemini_model(MamaBearTaskType.CODING), GEMINI_FLASH_MODEL) 
        self.agent.available_vertex_models = original_available_models 

    def test_vertex_ai_chat_uses_chosen_model(self):
        prompt = "Test prompt"
        self.mock_model_instance.generate_content.return_value = MagicMock(text="Flash response")
        response = self.agent.vertex_ai_chat(prompt, task_type=MamaBearTaskType.PLANNING)
        self.MockGenerativeModelClass.assert_called_with(GEMINI_FLASH_MODEL)
        self.mock_model_instance.generate_content.assert_called_with(prompt)
        self.assertEqual(response, "Flash response")

        self.MockGenerativeModelClass.reset_mock() 
        self.mock_model_instance.reset_mock()
        self.mock_model_instance.generate_content.return_value = MagicMock(text="Pro response")
        response = self.agent.vertex_ai_chat(prompt, task_type=MamaBearTaskType.CODING)
        self.MockGenerativeModelClass.assert_called_with(GEMINI_PRO_MODEL)
        self.mock_model_instance.generate_content.assert_called_with(prompt)
        self.assertEqual(response, "Pro response")

    def test_vertex_ai_chat_no_gcp_config(self):
        self.agent.google_cloud_project = None 
        response = self.agent.vertex_ai_chat("Hello", task_type=MamaBearTaskType.DEFAULT)
        self.assertIn("Error: Vertex AI (project/location) not configured", response)
        self.MockGenerativeModelClass.assert_not_called() 

    def test_vertex_ai_analyze_code_uses_chosen_model(self):
        code = "def f(): pass"
        self.mock_model_instance.generate_content.return_value = MagicMock(text="Pro analysis")
        response = self.agent.vertex_ai_analyze_code(code) 
        self.MockGenerativeModelClass.assert_called_with(GEMINI_PRO_MODEL) # Default for analyze_code is CODING
        self.mock_model_instance.generate_content.assert_called_once()
        self.assertIn(code, self.mock_model_instance.generate_content.call_args[0][0]) 
        self.assertEqual(response, "Pro analysis")

    def test_self_debug_with_rag_uses_correct_model(self):
        error_context = "RAG error context"
        self.mock_memory.search.return_value = [] 
        self.mock_model_instance.generate_content.return_value = MagicMock(text="RAG Pro response")
        
        suggestion = self.agent.self_debug_with_rag(error_context)
        
        self.MockGenerativeModelClass.assert_called_with(GEMINI_PRO_MODEL)
        self.assertEqual(suggestion, "RAG Pro response")
        self.mock_model_instance.generate_content.assert_called_once()


    def test_start_new_vertex_chat_session_uses_chosen_model(self):
        self.agent.start_new_vertex_chat_session() 
        self.MockGenerativeModelClass.assert_called_with(GEMINI_FLASH_MODEL)
        self.assertIsNotNone(self.agent.chat_session)
        self.assertEqual(self.agent.vertex_ai_model_name, GEMINI_FLASH_MODEL)
        self.mock_model_instance.start_chat.assert_called_once() 

        self.MockGenerativeModelClass.reset_mock()
        self.mock_model_instance.reset_mock() 
        self.mock_model_instance.start_chat.return_value = self.mock_chat_session 
        
        self.agent.start_new_vertex_chat_session(task_type=MamaBearTaskType.CODING)
        self.MockGenerativeModelClass.assert_called_with(GEMINI_PRO_MODEL)
        self.assertEqual(self.agent.vertex_ai_model_name, GEMINI_PRO_MODEL)
        self.mock_model_instance.start_chat.assert_called_once()

if __name__ == '__main__':
    unittest.main()

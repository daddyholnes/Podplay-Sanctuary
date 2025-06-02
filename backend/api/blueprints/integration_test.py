"""
Integration Workbench Test
Tests the integration between the Integration Workbench API and agent framework
"""
import sys
import os
import unittest
from flask import Flask
from api.blueprints.integration_api import integration_bp, initialize_integration_api

# Try to import from the agent framework
try:
    from services.agent_framework_enhanced import logger
    agent_framework_import_success = True
except ImportError as e:
    agent_framework_import_success = False
    import_error = str(e)

class IntegrationWorkbenchTest(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(integration_bp, url_prefix='/api/integration')
        self.client = self.app.test_client()
        
    def test_agent_framework_import(self):
        """Test that the agent framework can be imported correctly"""
        self.assertTrue(agent_framework_import_success, 
                       f"Failed to import agent framework: {import_error if 'import_error' in locals() else 'Unknown error'}")
        
    def test_integration_api_status(self):
        """Test that the integration API status endpoint works"""
        with self.app.app_context():
            response = self.client.get('/api/integration/status')
            self.assertEqual(response.status_code, 200)
            data = response.get_json()
            self.assertIn('status', data)
            
if __name__ == '__main__':
    unittest.main()

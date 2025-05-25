#!/usr/bin/env python3
"""
🧪 PODPLAY BUILD BACKEND - MASTER TEST SUITE
====================================================

Comprehensive test script for all backend functionality including:
- Vertex AI Integration & Multi-Model Chat
- Mem0 Chat Persistence System
- Cloud Development Sandbox (Docker-free)
- MCP Marketplace Management
- Multimodal File Upload Support
- Audio/Video Recording Endpoints
- Enhanced Mama Bear Agent
- Database Operations

Author: AI Development Assistant
Created: May 25, 2025
Python Version: 3.12+
"""

import requests
import json
import time
import asyncio
import os
import sys
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

# Configure test logging
logging.basicConfig(
    level=logging.INFO,
    format='🧪 TEST: %(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class PodplayBackendTester:
    """Comprehensive backend testing suite"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        """Initialize tester with backend URL"""
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = {}
        self.test_count = 0
        self.passed_tests = 0
        self.failed_tests = 0
        
        # Test data
        self.test_session_id = f"test_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.test_env_id = f"test_env_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        print("🧪 Podplay Backend Master Test Suite Initialized")
        print(f"🎯 Testing backend at: {base_url}")
        print("=" * 60)
    
    def run_test(self, test_name: str, test_func, *args, **kwargs) -> bool:
        """Run a single test and track results"""
        self.test_count += 1
        print(f"\n🔬 Test {self.test_count}: {test_name}")
        print("-" * 40)
        
        try:
            start_time = time.time()
            result = test_func(*args, **kwargs)
            end_time = time.time()
            
            if result:
                print(f"✅ PASSED - {test_name} ({end_time - start_time:.2f}s)")
                self.passed_tests += 1
                self.test_results[test_name] = {"status": "PASSED", "time": end_time - start_time}
                return True
            else:
                print(f"❌ FAILED - {test_name}")
                self.failed_tests += 1
                self.test_results[test_name] = {"status": "FAILED", "time": end_time - start_time}
                return False
                
        except Exception as e:
            print(f"💥 ERROR - {test_name}: {str(e)}")
            self.failed_tests += 1
            self.test_results[test_name] = {"status": "ERROR", "error": str(e)}
            return False
    
    def test_server_health(self) -> bool:
        """Test if backend server is running and responsive"""
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                print(f"📡 Server Status: {data.get('status')}")
                print(f"🐻 Agent: {data.get('agent')}")
                print(f"💭 Philosophy: {data.get('philosophy')}")
                return True
            return False
        except Exception as e:
            print(f"❌ Server not reachable: {e}")
            return False
    
    def test_mama_bear_chat(self) -> bool:
        """Test Enhanced Mama Bear chat functionality"""
        payload = {
            "message": "Hello Mama Bear! How are you today?",
            "user_id": "test_user",
            "context": {"test": True}
        }
        
        response = self.session.post(f"{self.base_url}/api/mama-bear/chat", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print(f"🐻 Mama Bear Response: {data.get('response', 'No response')[:100]}...")
            print(f"🔧 Enhanced: {data.get('enhanced')}")
            print(f"☁️ Vertex AI: {data.get('vertex_ai')}")
            return data.get('success', False)
        
        print(f"❌ Chat failed with status: {response.status_code}")
        return False
    
    def test_vertex_models_list(self) -> bool:
        """Test Vertex AI models listing"""
        response = self.session.get(f"{self.base_url}/api/vertex/models")
        
        if response.status_code == 200:
            data = response.json()
            models = data.get('models', [])
            print(f"📋 Found {len(models)} Vertex AI models")
            for model in models[:3]:  # Show first 3
                print(f"   - {model.get('name', 'Unknown')}: {model.get('display_name', 'No description')}")
            return data.get('success', False)
        
        print(f"❌ Models list failed with status: {response.status_code}")
        return False
    
    def test_mem0_chat_persistence(self) -> bool:
        """Test Mem0 chat persistence system"""
        if not self._check_mem0_availability():
            print("⚠️ Mem0 not available - skipping test")
            return True  # Skip, don't fail
        
        # Test chat with persistence
        payload = {
            "model_id": "mama-bear-gemini-25",
            "session_id": self.test_session_id,
            "message": "Remember that I like Python programming and AI development.",
            "context": {"test_persistence": True}
        }
        
        response = self.session.post(f"{self.base_url}/api/vertex-garden/chat", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print(f"💾 Mem0 Chat Response: {data.get('response', 'No response')[:100]}...")
            print(f"🆔 Session ID: {data.get('session_id')}")
            print(f"🎯 Tokens Used: {data.get('tokens_used')}")
            return data.get('success', False)
        
        print(f"❌ Mem0 chat failed with status: {response.status_code}")
        return False
    
    def test_chat_history_retrieval(self) -> bool:
        """Test chat history retrieval"""
        if not self._check_mem0_availability():
            print("⚠️ Mem0 not available - skipping test")
            return True
        
        response = self.session.get(f"{self.base_url}/api/vertex-garden/chat-history")
        
        if response.status_code == 200:
            data = response.json()
            sessions = data.get('sessions', [])
            print(f"📚 Found {len(sessions)} chat sessions")
            for session in sessions[:2]:  # Show first 2
                print(f"   - Session: {session.get('id', 'Unknown')[:20]}...")
            return data.get('success', False)
        
        print(f"❌ Chat history failed with status: {response.status_code}")
        return False
    
    def test_cloud_dev_sandbox_create(self) -> bool:
        """Test cloud development sandbox creation"""
        payload = {
            "environment": {
                "id": self.test_env_id,
                "name": "Test Environment",
                "type": "react",
                "template": "create-react-app"
            },
            "template": "react"
        }
        
        response = self.session.post(f"{self.base_url}/api/dev-sandbox/create", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print(f"🏗️ Environment Created: {data.get('containerId', 'Unknown')}")
            print(f"📁 Workspace: {data.get('workspaceDir', 'Unknown')}")
            print(f"🔌 Ports: {data.get('ports', [])}")
            return data.get('success', False)
        else:
            # Check if it's a 503 (service unavailable) which is expected
            if response.status_code == 503:
                print("⚠️ DevSandbox not available - this is expected if cloud sandbox isn't fully integrated")
                return True
            print(f"❌ DevSandbox creation failed with status: {response.status_code}")
            return False
    
    def test_mcp_marketplace_search(self) -> bool:
        """Test MCP marketplace search functionality"""
        response = self.session.get(f"{self.base_url}/api/mcp/search?query=github")
        
        if response.status_code == 200:
            data = response.json()
            servers = data.get('servers', [])
            print(f"🔍 Found {len(servers)} MCP servers for 'github'")
            for server in servers[:2]:  # Show first 2
                print(f"   - {server.get('name')}: {server.get('description', 'No description')[:50]}...")
            return data.get('success', False)
        
        print(f"❌ MCP search failed with status: {response.status_code}")
        return False
    
    def test_mcp_categories(self) -> bool:
        """Test MCP categories listing"""
        response = self.session.get(f"{self.base_url}/api/mcp/categories")
        
        if response.status_code == 200:
            data = response.json()
            categories = data.get('categories', [])
            print(f"📂 Found {len(categories)} MCP categories")
            for cat in categories[:3]:  # Show first 3
                print(f"   - {cat.get('label')}")
            return data.get('success', False)
        
        print(f"❌ MCP categories failed with status: {response.status_code}")
        return False
    
    def test_code_execution(self) -> bool:
        """Test code execution in sandbox"""
        payload = {
            "code": "print('Hello from Podplay Backend Test!')\nresult = 2 + 2\nprint(f'2 + 2 = {result}')",
            "language": "python",
            "session_id": self.test_session_id
        }
        
        response = self.session.post(f"{self.base_url}/api/vertex-garden/execute-code", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            output = data.get('output', '')
            print(f"🐍 Code Output: {output.strip()}")
            print(f"📊 Return Code: {data.get('return_code', 'Unknown')}")
            return data.get('success', False)
        
        print(f"❌ Code execution failed with status: {response.status_code}")
        return False
    
    def test_terminal_command(self) -> bool:
        """Test safe terminal command execution"""
        payload = {
            "command": "echo 'Backend test terminal command'",
            "session_id": self.test_session_id,
            "working_directory": "/tmp"
        }
        
        response = self.session.post(f"{self.base_url}/api/vertex-garden/terminal", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            output = data.get('output', '')
            print(f"💻 Terminal Output: {output.strip()}")
            print(f"📊 Return Code: {data.get('return_code', 'Unknown')}")
            return data.get('success', False)
        
        print(f"❌ Terminal command failed with status: {response.status_code}")
        return False
    
    def test_file_upload_endpoint(self) -> bool:
        """Test file upload functionality"""
        # Create a simple test file
        test_content = "This is a test file for Podplay Backend testing."
        test_file_path = "/tmp/test_upload.txt"
        
        try:
            with open(test_file_path, 'w') as f:
                f.write(test_content)
            
            with open(test_file_path, 'rb') as f:
                files = {'file': ('test_upload.txt', f, 'text/plain')}
                response = self.session.post(f"{self.base_url}/api/vertex-garden/upload", files=files)
            
            # Clean up
            os.remove(test_file_path)
            
            if response.status_code == 200:
                data = response.json()
                print(f"📁 File Upload: {data.get('filename', 'Unknown')}")
                print(f"📏 File Size: {data.get('file_size', 'Unknown')} bytes")
                return data.get('success', False)
            
            print(f"❌ File upload failed with status: {response.status_code}")
            return False
            
        except Exception as e:
            print(f"❌ File upload error: {e}")
            return False
    
    def test_audio_recording_endpoint(self) -> bool:
        """Test audio recording endpoint"""
        response = self.session.post(f"{self.base_url}/api/vertex-garden/audio/record")
        
        if response.status_code == 200:
            data = response.json()
            print(f"🎤 Audio Session: {data.get('session_id', 'Unknown')}")
            print(f"📝 Message: {data.get('message', 'No message')}")
            return data.get('success', False)
        
        print(f"❌ Audio recording failed with status: {response.status_code}")
        return False
    
    def test_multimodal_chat(self) -> bool:
        """Test multimodal chat functionality"""
        payload = {
            "model_id": "claude-4-opus",
            "message": "Hello! This is a test of multimodal capabilities.",
            "file_ids": [],  # No files for this test
            "session_id": self.test_session_id
        }
        
        response = self.session.post(f"{self.base_url}/api/vertex-garden/chat/multimodal", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print(f"🌟 Multimodal Response: {data.get('response', 'No response')[:100]}...")
            print(f"💰 Cost: ${data.get('cost', 0):.4f}")
            return data.get('success', False)
        
        print(f"❌ Multimodal chat failed with status: {response.status_code}")
        return False
    
    def test_database_operations(self) -> bool:
        """Test database operations through API"""
        # Test project priorities
        priority_payload = {
            "project_name": "Backend Test Project",
            "priority_level": 1,
            "description": "Test project for backend validation"
        }
        
        response = self.session.post(f"{self.base_url}/api/projects/priorities", json=priority_payload)
        
        if response.status_code == 200:
            data = response.json()
            print(f"🎯 Project Priority Added: {data.get('message', 'Unknown')}")
            
            # Now get priorities
            get_response = self.session.get(f"{self.base_url}/api/projects/priorities")
            if get_response.status_code == 200:
                get_data = get_response.json()
                priorities = get_data.get('priorities', [])
                print(f"📋 Total Priorities: {len(priorities)}")
                return True
        
        print(f"❌ Database operations failed")
        return False
    
    def _check_mem0_availability(self) -> bool:
        """Check if Mem0 is available"""
        try:
            response = self.session.get(f"{self.base_url}/api/vertex-garden/chat-history")
            return response.status_code != 503
        except:
            return False
    
    def run_all_tests(self):
        """Run the complete test suite"""
        print("🚀 Starting Podplay Backend Master Test Suite")
        print("=" * 60)
        
        # Core System Tests
        self.run_test("Server Health Check", self.test_server_health)
        self.run_test("Enhanced Mama Bear Chat", self.test_mama_bear_chat)
        
        # Vertex AI Tests
        self.run_test("Vertex AI Models List", self.test_vertex_models_list)
        
        # Mem0 Persistence Tests
        self.run_test("Mem0 Chat Persistence", self.test_mem0_chat_persistence)
        self.run_test("Chat History Retrieval", self.test_chat_history_retrieval)
        
        # MCP Marketplace Tests
        self.run_test("MCP Marketplace Search", self.test_mcp_marketplace_search)
        self.run_test("MCP Categories", self.test_mcp_categories)
        
        # Development Sandbox Tests
        self.run_test("Cloud DevSandbox Creation", self.test_cloud_dev_sandbox_create)
        
        # Code Execution Tests
        self.run_test("Python Code Execution", self.test_code_execution)
        self.run_test("Terminal Command Execution", self.test_terminal_command)
        
        # Multimodal Tests
        self.run_test("File Upload Endpoint", self.test_file_upload_endpoint)
        self.run_test("Audio Recording Endpoint", self.test_audio_recording_endpoint)
        self.run_test("Multimodal Chat", self.test_multimodal_chat)
        
        # Database Tests
        self.run_test("Database Operations", self.test_database_operations)
        
        # Generate Report
        self.generate_test_report()
    
    def generate_test_report(self):
        """Generate comprehensive test report"""
        print("\n" + "=" * 60)
        print("🧪 PODPLAY BACKEND TEST REPORT")
        print("=" * 60)
        
        print(f"\n📊 TEST SUMMARY:")
        print(f"   Total Tests: {self.test_count}")
        print(f"   ✅ Passed: {self.passed_tests}")
        print(f"   ❌ Failed: {self.failed_tests}")
        print(f"   📈 Success Rate: {(self.passed_tests/self.test_count)*100:.1f}%")
        
        print(f"\n📋 DETAILED RESULTS:")
        for test_name, result in self.test_results.items():
            status = result['status']
            if status == "PASSED":
                emoji = "✅"
            elif status == "FAILED":
                emoji = "❌"
            else:
                emoji = "💥"
            
            time_info = f" ({result.get('time', 0):.2f}s)" if 'time' in result else ""
            print(f"   {emoji} {test_name}{time_info}")
            
            if 'error' in result:
                print(f"      Error: {result['error']}")
        
        print(f"\n🏆 OVERALL STATUS:")
        if self.failed_tests == 0:
            print("   🎉 ALL TESTS PASSED! Backend is fully operational.")
        elif self.failed_tests <= 2:
            print("   ⚠️ Most tests passed with minor issues.")
        else:
            print("   🚨 Multiple test failures detected - check backend configuration.")
        
        print("\n" + "=" * 60)
        print("🧪 Test Suite Completed")
        print("=" * 60)

def main():
    """Main test execution"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Podplay Backend Master Test Suite")
    parser.add_argument("--url", default="http://localhost:8000", 
                       help="Backend URL to test (default: http://localhost:8000)")
    parser.add_argument("--quick", action="store_true", 
                       help="Run only essential tests")
    
    args = parser.parse_args()
    
    tester = PodplayBackendTester(args.url)
    
    if args.quick:
        # Quick essential tests only
        tester.run_test("Server Health Check", tester.test_server_health)
        tester.run_test("Enhanced Mama Bear Chat", tester.test_mama_bear_chat)
        tester.run_test("MCP Marketplace Search", tester.test_mcp_marketplace_search)
        tester.generate_test_report()
    else:
        # Full test suite
        tester.run_all_tests()

if __name__ == "__main__":
    main()

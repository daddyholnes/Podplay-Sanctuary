#!/usr/bin/env python3
"""
Podplay Sanctuary - Comprehensive API Integration Test
Tests all registered blueprints and endpoints to ensure full functionality
"""

import requests
import json
import time
import sys
from typing import Dict, List, Any

class SanctuaryAPITester:
    def __init__(self, base_url: str = "http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = []
        
    def log_result(self, test_name: str, status: str, details: str = ""):
        """Log test result"""
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        self.test_results.append(result)
        
        status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        print(f"{status_icon} {test_name}: {status}")
        if details:
            print(f"   └─ {details}")
    
    def test_endpoint(self, name: str, endpoint: str, method: str = "GET", data: Dict = None) -> bool:
        """Test a single endpoint"""
        try:
            url = f"{self.base_url}{endpoint}"
            
            if method == "GET":
                response = self.session.get(url, timeout=10)
            elif method == "POST":
                response = self.session.post(url, json=data, timeout=10)
            else:
                response = self.session.request(method, url, json=data, timeout=10)
            
            if response.status_code == 200:
                try:
                    json_data = response.json()
                    self.log_result(name, "PASS", f"Status: {response.status_code}, Response: {type(json_data).__name__}")
                    return True
                except:
                    self.log_result(name, "PASS", f"Status: {response.status_code}, Non-JSON response")
                    return True
            else:
                self.log_result(name, "FAIL", f"Status: {response.status_code}")
                return False
                
        except requests.exceptions.ConnectinError:
            self.log_result(name, "FAIL", "Connection failed - server not running")
            return False
        except requests.exceptions.Timeout:
            self.log_result(name, "FAIL", "Request timeout")
            return False
        except Exception as e:
            self.log_result(name, "FAIL", f"Error: {str(e)}")
            return False
    
    def run_comprehensive_tests(self):
        """Run comprehensive test suite"""
        print("🐻 Podplay Sanctuary - Comprehensive API Integration Test")
        print("=" * 60)
        
        # Basic health checks
        print("\n🏥 Health & Status Tests")
        self.test_endpoint("Root Endpoint", "/")
        self.test_endpoint("Health Check", "/health")
        self.test_endpoint("Database Health", "/health/database")
        self.test_endpoint("Comprehensive Health", "/comprehensive")
        self.test_endpoint("AI Models Status", "/ai-models")
        self.test_endpoint("Services Status", "/services")
        self.test_endpoint("Performance Metrics", "/performance")
        self.test_endpoint("System Alerts", "/alerts")
        
        # MCP Marketplace Tests
        print("\n📦 MCP Marketplace Tests")
        self.test_endpoint("MCP Search", "/api/mcp/search")
        self.test_endpoint("MCP Categories", "/api/mcp/categories")
        self.test_endpoint("MCP Installed", "/api/mcp/installed")
        self.test_endpoint("MCP Server Details", "/api/mcp/server/git-tools")
        self.test_endpoint("MCP Recommendations", "/api/mcp/recommendations/web-development")
        
        # Chat API Tests
        print("\n💬 Chat API Tests")
        chat_payload = {
            "message": "Hello Mama Bear! This is a test message.",
            "session_id": "test-session-001",
            "model": "mama-bear"
        }
        self.test_endpoint("Mama Bear Chat", "/api/chat/mama-bear", "POST", chat_payload)
        self.test_endpoint("Chat Models", "/api/chat/models")
        self.test_endpoint("Available Models", "/api/chat/models/available")
        self.test_endpoint("Model Performance", "/api/chat/models/performance")
        self.test_endpoint("Daily Briefing", "/api/chat/daily-briefing")
        
        # Control Center Tests
        print("\n🎛️ Mama Bear Control Center Tests")
        self.test_endpoint("Control Center Health", "/api/mama-bear/health")
        self.test_endpoint("Code Server Instances", "/api/mama-bear/code-server/instances")
        self.test_endpoint("Code Server Templates", "/api/mama-bear/code-server/templates")
        self.test_endpoint("Agent Commands", "/api/mama-bear/agent/commands")
        self.test_endpoint("System Metrics", "/api/mama-bear/system/metrics")
        self.test_endpoint("Workspace List", "/api/mama-bear/workspace/list")
        self.test_endpoint("Extensions List", "/api/mama-bear/extensions/list")
        
        # Scout Agent Tests
        print("\n🔍 Scout Agent Tests")
        self.test_endpoint("Scout Projects", "/api/v1/scout_agent/projects")
        self.test_endpoint("Scout System Metrics", "/api/v1/scout_agent/system/metrics")
        self.test_endpoint("Scout Services Status", "/api/v1/scout_agent/services/status")
        self.test_endpoint("Scout Logs", "/api/v1/scout_agent/logs/tail")
        self.test_endpoint("Scout Alerts", "/api/v1/scout_agent/alerts")
        self.test_endpoint("Scout Deployment Status", "/api/v1/scout_agent/deployment/status")
        self.test_endpoint("Scout Performance Analytics", "/api/v1/scout_agent/performance/analytics")
        
        # NixOS Integration Tests
        print("\n🐧 NixOS Integration Tests")
        self.test_endpoint("NixOS Workspaces", "/api/nixos/workspaces")
        self.test_endpoint("NixOS Templates", "/api/nixos/templates")
        
        # DevSandbox Tests
        print("\n🛠️ DevSandbox Tests")
        self.test_endpoint("DevSandbox Environments", "/api/devsandbox/environments")
        self.test_endpoint("DevSandbox Templates", "/api/devsandbox/templates")
        self.test_endpoint("DevSandbox Environment Details", "/api/devsandbox/environment/env-python-001")
        
        # ADK Workflow Tests
        print("\n🤖 ADK Workflow Tests")
        self.test_endpoint("ADK Workflows List", "/api/adk-workflows/list")
        self.test_endpoint("ADK Models Status", "/api/adk-workflows/models/status")
        self.test_endpoint("ADK System Health", "/api/adk-workflows/system/health")
        self.test_endpoint("ADK System Capabilities", "/api/adk-workflows/system/capabilities")
        self.test_endpoint("ADK Templates", "/api/adk-workflows/templates")
        
        # Generate summary report
        self.generate_summary_report()
    
    def generate_summary_report(self):
        """Generate test summary report"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY REPORT")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "PASS"])
        failed_tests = len([r for r in self.test_results if r["status"] == "FAIL"])
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if result["status"] == "FAIL":
                    print(f"   - {result['test']}: {result['details']}")
        
        # Save detailed report
        with open("test_results.json", "w") as f:
            json.dump({
                "summary": {
                    "total": total_tests,
                    "passed": passed_tests,
                    "failed": failed_tests,
                    "success_rate": (passed_tests/total_tests)*100
                },
                "results": self.test_results
            }, f, indent=2)
        
        print(f"\n📄 Detailed report saved to: test_results.json")
        
        if failed_tests == 0:
            print("\n🎉 ALL TESTS PASSED! Podplay Sanctuary is fully functional!")
        else:
            print(f"\n⚠️ {failed_tests} test(s) failed. Please review the issues above.")

def main():
    """Main test execution"""
    print("🚀 Starting Podplay Sanctuary API Integration Tests...")
    
    tester = SanctuaryAPITester()
    
    # Test server connectivity first
    try:
        response = requests.get("http://localhost:5000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Server is running and accessible")
            tester.run_comprehensive_tests()
        else:
            print("❌ Server returned unexpected status code:", response.status_code)
            sys.exit(1)
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Please ensure the backend is running on localhost:5000")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error connecting to server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

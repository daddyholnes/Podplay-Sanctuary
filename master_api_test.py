#!/usr/bin/env python3
"""
Master API Test Suite for Podplay Sanctuary Backend
===================================================

Comprehensive testing of all API endpoints and functionality in the new modular architecture.
This test suite validates the complete backend migration from monolithic to modular structure.

Test Categories:
1. Health Check Endpoints
2. MCP Marketplace API 
3. Chat & AI Endpoints
4. Scout Agent API
5. Development Tools
6. Socket.IO Real-time Communication

Usage:
    python master_api_test.py [--verbose] [--category CATEGORY] [--endpoint ENDPOINT]

Examples:
    python master_api_test.py                    # Run all tests
    python master_api_test.py --verbose         # Detailed output
    python master_api_test.py --category health # Test only health endpoints
    python master_api_test.py --endpoint /health # Test specific endpoint
"""

import requests
import json
import time
import argparse
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
import socketio
import threading
from dataclasses import dataclass
from enum import Enum

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('master_api_test.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class TestStatus(Enum):
    """Test result status"""
    PASS = "✅ PASS"
    FAIL = "❌ FAIL" 
    SKIP = "⏭️ SKIP"
    WARN = "⚠️ WARN"

@dataclass
class TestResult:
    """Individual test result"""
    endpoint: str
    method: str
    status: TestStatus
    response_time: float
    status_code: Optional[int] = None
    message: str = ""
    response_data: Optional[Dict] = None

class PodplaySanctuaryTester:
    """Master test suite for Podplay Sanctuary backend"""
    
    def __init__(self, base_url: str = "http://127.0.0.1:5000", verbose: bool = False):
        self.base_url = base_url
        self.verbose = verbose
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
        self.results: List[TestResult] = []
        self.socket_client = None
        self.socket_events = []
        
    def log_test(self, result: TestResult):
        """Log and store test result"""
        self.results.append(result)
        
        # Color coding for terminal output
        color_map = {
            TestStatus.PASS: '\033[92m',  # Green
            TestStatus.FAIL: '\033[91m',  # Red
            TestStatus.SKIP: '\033[93m',  # Yellow
            TestStatus.WARN: '\033[93m'   # Yellow
        }
        reset = '\033[0m'
        
        status_str = f"{color_map.get(result.status, '')}{result.status.value}{reset}"
        
        if self.verbose:
            logger.info(f"{status_str} {result.method} {result.endpoint} "
                       f"({result.response_time:.3f}s) - {result.message}")
            if result.response_data and self.verbose:
                logger.info(f"   Response: {json.dumps(result.response_data, indent=2)[:200]}...")
        else:
            logger.info(f"{status_str} {result.method} {result.endpoint} ({result.response_time:.3f}s)")

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    params: Optional[Dict] = None) -> TestResult:
        """Make HTTP request and return test result"""
        url = f"{self.base_url}{endpoint}"
        start_time = time.time()
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, params=params)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, params=params)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data, params=params)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, params=params)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            response_time = time.time() - start_time
            
            # Determine test status
            if response.status_code < 400:
                status = TestStatus.PASS
                message = f"HTTP {response.status_code}"
            elif response.status_code == 404:
                status = TestStatus.WARN
                message = f"Endpoint not found (HTTP {response.status_code})"
            else:
                status = TestStatus.FAIL
                message = f"HTTP {response.status_code} - {response.text[:100]}"
            
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text[:200]}
                
            return TestResult(
                endpoint=endpoint,
                method=method.upper(),
                status=status,
                response_time=response_time,
                status_code=response.status_code,
                message=message,
                response_data=response_data
            )
            
        except Exception as e:
            response_time = time.time() - start_time
            return TestResult(
                endpoint=endpoint,
                method=method.upper(),
                status=TestStatus.FAIL,
                response_time=response_time,
                message=f"Request failed: {str(e)}"
            )

    def test_health_endpoints(self):
        """Test health check endpoints"""
        logger.info("\n🏥 TESTING HEALTH CHECK ENDPOINTS")
        logger.info("=" * 50)
        
        endpoints = [
            ("/health", "GET"),
            ("/health/live", "GET"),
            ("/health/ready", "GET"),
            ("/health/detailed", "GET")
        ]
        
        for endpoint, method in endpoints:
            result = self.make_request(method, endpoint)
            self.log_test(result)

    def test_mcp_marketplace_api(self):
        """Test MCP Marketplace API endpoints"""
        logger.info("\n🏪 TESTING MCP MARKETPLACE API")
        logger.info("=" * 50)
        
        endpoints = [
            ("/api/mcp/categories", "GET"),
            ("/api/mcp/trending", "GET"),
            ("/api/mcp/recommendations", "GET"),
            ("/api/mcp/installed", "GET"),
            ("/api/mcp/search", "GET", {"q": "test"}),
            ("/api/mcp/server/test-server", "GET"),
        ]
        
        for endpoint_data in endpoints:
            if len(endpoint_data) == 2:
                endpoint, method = endpoint_data
                result = self.make_request(method, endpoint)
            else:
                endpoint, method, params = endpoint_data
                result = self.make_request(method, endpoint, params=params)
            self.log_test(result)

    def test_chat_ai_endpoints(self):
        """Test Chat & AI endpoints"""
        logger.info("\n🧠 TESTING CHAT & AI ENDPOINTS")
        logger.info("=" * 50)
        
        # Test chat endpoint
        chat_data = {
            "message": "Hello Mama Bear, this is a test message",
            "user_id": "test_user_123",
            "session_id": "test_session_456"
        }
        
        endpoints = [
            ("/api/mama-bear/chat", "POST", chat_data),
            ("/api/mama-bear/briefing", "GET"),
            ("/api/mama-bear/memory/search", "GET", {"query": "test"}),
            ("/api/mama-bear/learn", "POST", {"content": "Test learning content"}),
            ("/api/mama-bear/execute-code", "POST", {"code": "print('Hello World')", "language": "python"})
        ]
        
        for endpoint_data in endpoints:
            if len(endpoint_data) == 2:
                endpoint, method = endpoint_data
                result = self.make_request(method, endpoint)
            elif len(endpoint_data) == 3:
                endpoint, method, data_or_params = endpoint_data
                if method == "GET":
                    result = self.make_request(method, endpoint, params=data_or_params)
                else:
                    result = self.make_request(method, endpoint, data=data_or_params)
            self.log_test(result)

    def test_scout_agent_api(self):
        """Test Scout Agent API endpoints"""
        logger.info("\n🔍 TESTING SCOUT AGENT API")
        logger.info("=" * 50)
        
        endpoints = [
            ("/api/v1/scout_agent/projects", "GET"),
            ("/api/v1/scout_agent/projects/test-project-alpha/status", "GET"),
            ("/api/v1/scout_agent/services/status", "GET"),
            ("/api/v1/scout_agent/system/metrics", "GET"),
            ("/api/v1/scout_agent/deployment/status", "GET"),
            ("/api/v1/scout_agent/performance/analytics", "GET"),
            ("/api/v1/scout_agent/alerts", "GET"),
            ("/api/v1/scout_agent/logs/tail", "GET"),
            ("/api/v1/scout_agent/monitoring/configure", "POST", {"metrics": ["cpu", "memory"]})
        ]
        
        for endpoint_data in endpoints:
            if len(endpoint_data) == 2:
                endpoint, method = endpoint_data
                result = self.make_request(method, endpoint)
            else:
                endpoint, method, data = endpoint_data
                result = self.make_request(method, endpoint, data=data)
            self.log_test(result)

    def test_development_tools(self):
        """Test development tools endpoints"""
        logger.info("\n🔧 TESTING DEVELOPMENT TOOLS")
        logger.info("=" * 50)
        
        endpoints = [
            ("/api/dev/ping", "GET"),
            ("/api/dev/services/status", "GET"),
            ("/api/dev/database/info", "GET"),
            ("/api/dev/performance/metrics", "GET"),
            ("/api/dev/logs/recent", "GET"),
            ("/api/dev/test/connectivity", "GET"),
            ("/api/dev/mcp-data/info", "GET"),
            ("/api/dev/echo", "POST", {"message": "test echo"}),
            ("/api/dev/validate/json", "POST", {"test": "valid json"}),
            ("/api/dev/validate/url", "POST", {"url": "https://example.com"}),
            ("/api/dev/validate/mcp-server", "POST", {"name": "test-server", "command": "test"})
        ]
        
        for endpoint_data in endpoints:
            if len(endpoint_data) == 2:
                endpoint, method = endpoint_data
                result = self.make_request(method, endpoint)
            else:
                endpoint, method, data = endpoint_data
                result = self.make_request(method, endpoint, data=data)
            self.log_test(result)

    def test_socket_io_connection(self):
        """Test Socket.IO real-time communication"""
        logger.info("\n🔌 TESTING SOCKET.IO COMMUNICATION")
        logger.info("=" * 50)
        
        try:
            # Create Socket.IO client
            self.socket_client = socketio.SimpleClient()
            
            start_time = time.time()
            self.socket_client.connect(self.base_url)
            connection_time = time.time() - start_time
            
            result = TestResult(
                endpoint="/socket.io/",
                method="CONNECT",
                status=TestStatus.PASS,
                response_time=connection_time,
                message="Socket.IO connection established"
            )
            self.log_test(result)
            
            # Test emit and receive
            start_time = time.time()
            self.socket_client.emit('test_event', {'message': 'test'})
            emit_time = time.time() - start_time
            
            result = TestResult(
                endpoint="/socket.io/",
                method="EMIT",
                status=TestStatus.PASS,
                response_time=emit_time,
                message="Event emitted successfully"
            )
            self.log_test(result)
            
            # Disconnect
            self.socket_client.disconnect()
            
            result = TestResult(
                endpoint="/socket.io/",
                method="DISCONNECT",
                status=TestStatus.PASS,
                response_time=0.001,
                message="Socket.IO disconnected cleanly"
            )
            self.log_test(result)
            
        except Exception as e:
            result = TestResult(
                endpoint="/socket.io/",
                method="CONNECT",
                status=TestStatus.FAIL,
                response_time=0.0,
                message=f"Socket.IO test failed: {str(e)}"
            )
            self.log_test(result)

    def test_server_availability(self):
        """Test basic server availability"""
        logger.info("\n🌐 TESTING SERVER AVAILABILITY")
        logger.info("=" * 50)
        
        try:
            start_time = time.time()
            response = self.session.get(self.base_url)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                status = TestStatus.PASS
                message = "Server is accessible"
            else:
                status = TestStatus.WARN
                message = f"Server responded with HTTP {response.status_code}"
                
            result = TestResult(
                endpoint="/",
                method="GET",
                status=status,
                response_time=response_time,
                status_code=response.status_code,
                message=message
            )
            self.log_test(result)
            
        except Exception as e:
            result = TestResult(
                endpoint="/",
                method="GET",
                status=TestStatus.FAIL,
                response_time=0.0,
                message=f"Server not accessible: {str(e)}"
            )
            self.log_test(result)

    def run_all_tests(self):
        """Run all test categories"""
        logger.info(f"\n🚀 STARTING MASTER API TEST SUITE")
        logger.info(f"Target: {self.base_url}")
        logger.info(f"Time: {datetime.now().isoformat()}")
        logger.info("=" * 70)
        
        # Run all test categories
        self.test_server_availability()
        self.test_health_endpoints()
        self.test_mcp_marketplace_api()
        self.test_chat_ai_endpoints()
        self.test_scout_agent_api()
        self.test_development_tools()
        self.test_socket_io_connection()
        
        # Generate summary
        self.generate_test_summary()

    def run_category_tests(self, category: str):
        """Run tests for specific category"""
        category_map = {
            'health': self.test_health_endpoints,
            'mcp': self.test_mcp_marketplace_api,
            'chat': self.test_chat_ai_endpoints,
            'scout': self.test_scout_agent_api,
            'dev': self.test_development_tools,
            'socket': self.test_socket_io_connection,
            'server': self.test_server_availability
        }
        
        if category in category_map:
            logger.info(f"\n🎯 RUNNING {category.upper()} TESTS ONLY")
            logger.info("=" * 50)
            category_map[category]()
            self.generate_test_summary()
        else:
            logger.error(f"Unknown category: {category}")
            logger.info(f"Available categories: {', '.join(category_map.keys())}")

    def test_specific_endpoint(self, endpoint: str, method: str = "GET"):
        """Test specific endpoint"""
        logger.info(f"\n🎯 TESTING SPECIFIC ENDPOINT: {method} {endpoint}")
        logger.info("=" * 50)
        
        result = self.make_request(method, endpoint)
        self.log_test(result)
        self.generate_test_summary()

    def generate_test_summary(self):
        """Generate comprehensive test summary"""
        logger.info("\n📊 TEST SUMMARY")
        logger.info("=" * 50)
        
        # Count results by status
        status_counts = {}
        total_time = 0
        
        for result in self.results:
            status = result.status
            status_counts[status] = status_counts.get(status, 0) + 1
            total_time += result.response_time
        
        # Print summary
        total_tests = len(self.results)
        logger.info(f"Total Tests: {total_tests}")
        logger.info(f"Total Time: {total_time:.3f}s")
        logger.info(f"Average Response Time: {total_time/max(total_tests, 1):.3f}s")
        logger.info("")
        
        for status, count in status_counts.items():
            percentage = (count / total_tests) * 100
            logger.info(f"{status.value}: {count} ({percentage:.1f}%)")
        
        # Show failed tests
        failed_tests = [r for r in self.results if r.status == TestStatus.FAIL]
        if failed_tests:
            logger.info(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
            for result in failed_tests:
                logger.info(f"   {result.method} {result.endpoint} - {result.message}")
        
        # Show warnings
        warned_tests = [r for r in self.results if r.status == TestStatus.WARN]
        if warned_tests:
            logger.info(f"\n⚠️ WARNINGS ({len(warned_tests)}):")
            for result in warned_tests:
                logger.info(f"   {result.method} {result.endpoint} - {result.message}")
        
        # Overall status
        if not failed_tests:
            if not warned_tests:
                logger.info(f"\n🎉 ALL TESTS PASSED! Backend is fully functional.")
            else:
                logger.info(f"\n✅ TESTS COMPLETED with {len(warned_tests)} warnings.")
        else:
            logger.info(f"\n💥 {len(failed_tests)} TESTS FAILED - Backend issues detected.")
        
        logger.info("=" * 50)

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Master API Test Suite for Podplay Sanctuary")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--base-url", default="http://127.0.0.1:5000", help="Backend base URL")
    parser.add_argument("--category", choices=['health', 'mcp', 'chat', 'scout', 'dev', 'socket', 'server'], 
                       help="Test specific category only")
    parser.add_argument("--endpoint", help="Test specific endpoint")
    parser.add_argument("--method", default="GET", help="HTTP method for specific endpoint test")
    
    args = parser.parse_args()
    
    # Create tester instance
    tester = PodplaySanctuaryTester(base_url=args.base_url, verbose=args.verbose)
    
    try:
        if args.endpoint:
            tester.test_specific_endpoint(args.endpoint, args.method)
        elif args.category:
            tester.run_category_tests(args.category)
        else:
            tester.run_all_tests()
            
    except KeyboardInterrupt:
        logger.info("\n🛑 Tests interrupted by user")
    except Exception as e:
        logger.error(f"💥 Test suite failed: {e}")
        raise

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Test Script for ADK Workflow Integration
Tests both the legacy app-beta.py endpoints and the new factory-based blueprint
"""

import requests
import json
import time
from datetime import datetime

# Test configuration
BASE_URL_LEGACY = "http://localhost:5000"  # app-beta.py
BASE_URL_NEW = "http://localhost:5001"     # app_new.py (if running)

def test_endpoint(url, name, expected_status=200):
    """Test a single endpoint"""
    print(f"\n🧪 Testing {name}")
    print(f"   URL: {url}")
    
    try:
        response = requests.get(url, timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == expected_status:
            print(f"   ✅ Success")
            if response.headers.get('content-type', '').startswith('application/json'):
                data = response.json()
                print(f"   Response: {json.dumps(data, indent=2)[:200]}...")
                return data
        else:
            print(f"   ❌ Expected {expected_status}, got {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
            
    except requests.exceptions.ConnectionError:
        print(f"   ❌ Connection failed - server not running?")
    except requests.exceptions.Timeout:
        print(f"   ❌ Request timeout")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    return None

def test_post_endpoint(url, data, name, expected_status=200):
    """Test a POST endpoint"""
    print(f"\n🧪 Testing {name} (POST)")
    print(f"   URL: {url}")
    print(f"   Data: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.post(url, json=data, timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == expected_status:
            print(f"   ✅ Success")
            if response.headers.get('content-type', '').startswith('application/json'):
                result = response.json()
                print(f"   Response: {json.dumps(result, indent=2)[:300]}...")
                return result
        else:
            print(f"   ❌ Expected {expected_status}, got {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
            
    except requests.exceptions.ConnectionError:
        print(f"   ❌ Connection failed - server not running?")
    except requests.exceptions.Timeout:
        print(f"   ❌ Request timeout")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    return None

def test_legacy_app():
    """Test ADK endpoints in app-beta.py"""
    print("\n" + "="*60)
    print("🔧 TESTING LEGACY APP (app-beta.py)")
    print("="*60)
    
    # Test basic health endpoint
    test_endpoint(f"{BASE_URL_LEGACY}/", "Root endpoint")
    
    # Test ADK workflow endpoints
    test_endpoint(f"{BASE_URL_LEGACY}/api/adk/workflows", "Get workflows")
    test_endpoint(f"{BASE_URL_LEGACY}/api/adk/models/status", "Models status")
    test_endpoint(f"{BASE_URL_LEGACY}/api/adk/system/health", "System health")
    test_endpoint(f"{BASE_URL_LEGACY}/api/adk/system/capabilities", "System capabilities")
    
    # Test workflow creation
    workflow_data = {
        "name": "Test Research Workflow",
        "description": "Test workflow for integration testing",
        "models": ["claude-3.5-sonnet", "gpt-4o"],
        "steps": [
            "research",
            "analysis", 
            "synthesis"
        ]
    }
    test_post_endpoint(f"{BASE_URL_LEGACY}/api/adk/workflows/create", workflow_data, "Create workflow")
    
    # Test workflow execution
    execution_data = {
        "workflow_type": "research-analysis",
        "task": "Research the latest developments in AI workflow orchestration",
        "models": ["claude-3.5-sonnet"]
    }
    result = test_post_endpoint(f"{BASE_URL_LEGACY}/api/adk/workflows/execute", execution_data, "Execute workflow")
    
    if result and result.get("execution_id"):
        # Test execution status
        execution_id = result["execution_id"]
        time.sleep(2)  # Wait a bit for execution to start
        test_endpoint(f"{BASE_URL_LEGACY}/api/adk/workflows/execution/{execution_id}", "Execution status")

def test_factory_app():
    """Test ADK endpoints in the factory-based app"""
    print("\n" + "="*60)
    print("🏗️  TESTING FACTORY APP (app_new.py)")
    print("="*60)
    
    # Test basic health endpoint
    test_endpoint(f"{BASE_URL_NEW}/", "Root endpoint")
    
    # Test ADK workflow endpoints  
    test_endpoint(f"{BASE_URL_NEW}/api/adk-workflows/list", "List workflows")
    test_endpoint(f"{BASE_URL_NEW}/api/adk-workflows/models/status", "Models status")
    test_endpoint(f"{BASE_URL_NEW}/api/adk-workflows/system/health", "System health")
    test_endpoint(f"{BASE_URL_NEW}/api/adk-workflows/system/capabilities", "System capabilities")
    test_endpoint(f"{BASE_URL_NEW}/api/adk-workflows/templates", "Workflow templates")
    
    # Test workflow creation from template
    template_data = {
        "name": "Test Documentation Workflow",
        "user_id": "test_user",
        "parameters": {
            "source_path": "/test/code",
            "output_format": "markdown"
        }
    }
    test_post_endpoint(f"{BASE_URL_NEW}/api/adk-workflows/templates/documentation-generation/create", 
                       template_data, "Create workflow from template")
    
    # Test custom workflow creation
    custom_workflow = {
        "type": "sequential",
        "name": "Custom Test Workflow", 
        "description": "Testing custom workflow creation",
        "steps": [
            {"name": "analyze", "model": "Gemini 2.0 Flash"},
            {"name": "synthesize", "model": "Claude 3.5 Sonnet"}
        ],
        "preferred_models": ["Gemini 2.0 Flash", "Claude 3.5 Sonnet"]
    }
    result = test_post_endpoint(f"{BASE_URL_NEW}/api/adk-workflows/create", custom_workflow, "Create custom workflow")
    
    if result and result.get("workflow_id"):
        # Test workflow execution
        execution_data = {
            "workflow_id": result["workflow_id"],
            "inputs": {
                "task": "Test the newly created workflow",
                "context": "integration testing"
            },
            "mode": "async"
        }
        test_post_endpoint(f"{BASE_URL_NEW}/api/adk-workflows/execute", execution_data, "Execute custom workflow")

def main():
    """Main test function"""
    print("🚀 ADK Workflow Integration Test Suite")
    print(f"⏰ Started at: {datetime.now().isoformat()}")
    print("\nThis test will check both the legacy app-beta.py and new factory-based app endpoints")
    print("Make sure at least one server is running before proceeding...")
    
    input("\nPress Enter to start testing...")
    
    # Test legacy app first
    test_legacy_app()
    
    # Test factory app 
    test_factory_app()
    
    print("\n" + "="*60)
    print("🏁 TEST SUITE COMPLETED")
    print("="*60)
    print("📋 Summary:")
    print("   - Legacy endpoints tested with /api/adk/ prefix")
    print("   - Factory endpoints tested with /api/adk-workflows/ prefix") 
    print("   - Both apps should be able to handle ADK workflow requests")
    print("   - Check server logs for detailed error information")
    print(f"\n⏰ Completed at: {datetime.now().isoformat()}")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Test chat endpoints
"""
import requests
import json

def test_chat_endpoints():
    base_url = "http://localhost:5000"
    
    # Test data
    test_message = {
        "message": "Hello, testing the chat",
        "user_id": "test_user"
    }
    
    endpoints_to_test = [
        "/api/test-connection",
        "/api/mcp/manage", 
        "/api/chat/vertex-garden/chat",
        "/api/chat/mama-bear"
    ]
    
    print("🧪 Testing Podplay Sanctuary Endpoints")
    print("=" * 50)
    
    for endpoint in endpoints_to_test:
        print(f"\n📍 Testing: {endpoint}")
        
        try:
            if endpoint in ["/api/test-connection", "/api/mcp/manage"]:
                # GET requests
                response = requests.get(f"{base_url}{endpoint}", timeout=10)
            else:
                # POST requests with JSON
                response = requests.post(
                    f"{base_url}{endpoint}", 
                    json=test_message,
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"   ✅ Success: {data.get('success', 'N/A')}")
                    if 'message' in data:
                        print(f"   📝 Message: {data['message'][:100]}...")
                    if 'response' in data:
                        print(f"   🤖 Response: {data['response'][:100]}...")
                except:
                    print(f"   📄 Raw response: {response.text[:200]}...")
            else:
                print(f"   ❌ Error: {response.text[:200]}...")
                
        except requests.exceptions.ConnectionError:
            print(f"   🔌 Connection Error: Backend not running on {base_url}")
        except requests.exceptions.Timeout:
            print(f"   ⏰ Timeout: Request took too long")
        except Exception as e:
            print(f"   💥 Exception: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 Test completed!")

if __name__ == "__main__":
    test_chat_endpoints()

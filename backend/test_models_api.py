#!/usr/bin/env python3
"""
Test script for Models API
Tests the endpoints for model listings, chat completion, file uploads, and transcription
"""

import requests
import json
import os
import sys
from pprint import pprint

# Base URL for API
BASE_URL = "http://localhost:5000"

def test_get_models():
    """Test the models listing endpoint"""
    print("\n===== Testing Models Listing =====")
    response = requests.get(f"{BASE_URL}/api/models")
    
    if response.status_code == 200:
        print("✅ Successfully retrieved models")
        models = response.json().get("models", {})
        print(f"Found {len(models)} models:")
        for model_id, model_info in models.items():
            print(f"  • {model_id}: {model_info.get('displayName')} ({model_info.get('provider')})")
    else:
        print(f"❌ Failed to retrieve models: {response.status_code}")
        print(response.text)
    
    return response.json() if response.status_code == 200 else None

def test_chat_completion(model_id="gemini-1.5-flash"):
    """Test the chat completion endpoint with a simple message"""
    print(f"\n===== Testing Chat Completion with {model_id} =====")
    
    data = {
        "model": model_id,
        "messages": [
            {"role": "user", "content": "Hello, what can you do to help me with Podplay Sanctuary?"}
        ],
        "files": []
    }
    
    response = requests.post(f"{BASE_URL}/api/chat/completion", json=data)
    
    if response.status_code == 200:
        print("✅ Successfully received chat completion")
        result = response.json()
        print("\nResponse content:")
        print(f"  Model: {result.get('model')}")
        print(f"  Role: {result.get('role')}")
        print(f"  Content: {result.get('content')[:200]}...")
        
        if 'usage' in result:
            print("\nToken usage:")
            print(f"  Prompt tokens: {result['usage'].get('promptTokens')}")
            print(f"  Completion tokens: {result['usage'].get('completionTokens')}")
            print(f"  Total tokens: {result['usage'].get('totalTokens')}")
    else:
        print(f"❌ Failed to get chat completion: {response.status_code}")
        print(response.text)
    
    return response.json() if response.status_code == 200 else None

def test_file_upload(file_path):
    """Test the file upload endpoint"""
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return None
    
    print(f"\n===== Testing File Upload with {os.path.basename(file_path)} =====")
    
    with open(file_path, 'rb') as f:
        files = {'files': (os.path.basename(file_path), f)}
        response = requests.post(f"{BASE_URL}/api/upload", files=files)
    
    if response.status_code == 200:
        print("✅ Successfully uploaded file")
        result = response.json()
        uploaded_files = result.get('files', [])
        
        for file in uploaded_files:
            print(f"  • File ID: {file.get('id')}")
            print(f"    Name: {file.get('name')}")
            print(f"    Type: {file.get('type')}")
            print(f"    Size: {file.get('size')} bytes")
            print(f"    URL: {file.get('url')}")
            print(f"    Preview: {file.get('preview') or 'None'}")
    else:
        print(f"❌ Failed to upload file: {response.status_code}")
        print(response.text)
    
    return response.json().get('files', []) if response.status_code == 200 else None

def test_multimodal_chat_with_image(model_id="gemini-1.5-pro", image_path=None):
    """Test chat completion with an image"""
    if not image_path or not os.path.exists(image_path):
        print(f"❌ Image file not found: {image_path}")
        return None
    
    # First upload the image
    uploaded_files = test_file_upload(image_path)
    if not uploaded_files:
        return None
    
    image_file = uploaded_files[0]
    
    print(f"\n===== Testing Multimodal Chat with {model_id} and Image =====")
    
    data = {
        "model": model_id,
        "messages": [
            {"role": "user", "content": "What's in this image? Please describe it in detail."}
        ],
        "files": [image_file]
    }
    
    response = requests.post(f"{BASE_URL}/api/chat/completion", json=data)
    
    if response.status_code == 200:
        print("✅ Successfully received multimodal chat completion")
        result = response.json()
        print("\nResponse content:")
        print(f"  Model: {result.get('model')}")
        print(f"  Content: {result.get('content')[:300]}...")
    else:
        print(f"❌ Failed to get multimodal chat completion: {response.status_code}")
        print(response.text)
    
    return response.json() if response.status_code == 200 else None

def main():
    """Run all tests"""
    print("🧪 Starting API Tests for Podplay Sanctuary")
    
    # Test models listing
    models_data = test_get_models()
    
    # Test chat completion
    chat_result = test_chat_completion()
    
    # Test file upload (if a file is provided)
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
        uploaded_files = test_file_upload(file_path)
        
        # If it's an image, test multimodal chat
        if uploaded_files and uploaded_files[0].get('type', '').startswith('image/'):
            multimodal_result = test_multimodal_chat_with_image(image_path=file_path)
    
    print("\n🎉 API Tests Completed")

if __name__ == "__main__":
    main()

#!/bin/bash
echo "Testing Together.ai integration with Mama Bear..."
echo "Sending test message to http://localhost:5000/api/mama-bear/chat"
echo ""

curl -X POST http://localhost:5000/api/mama-bear/chat \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "Hello Mama Bear! Can you help me test the Together.ai integration? Please respond with your caring personality!", 
    "user_id": "nathan"
  }' | jq .

echo ""
echo "Test completed!"

#!/usr/bin/env python3
"""
Minimal Flask app for testing connectivity
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='🧪 Test API: %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def root():
    return jsonify({"status": "success", "message": "Test backend is running!"})

@app.route('/api/test', methods=['GET'])
def test_api():
    return jsonify({"status": "success", "message": "API test successful!"})

@app.route('/api/mama-bear/chat', methods=['GET', 'POST'])
def mama_bear_chat():
    if request.method == 'GET':
        return jsonify({"status": "success", "message": "Mama Bear chat endpoint is working!"})
    else:
        # Handle POST request
        message = request.form.get('message', 'No message provided')
        return jsonify({
            "status": "success", 
            "response": f"Echo: {message}",
            "message": "Chat message received successfully!"
        })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "Test Backend"})

if __name__ == '__main__':
    logger.info("🚀 Starting minimal test backend server...")
    app.run(host='0.0.0.0', port=5000, debug=True)

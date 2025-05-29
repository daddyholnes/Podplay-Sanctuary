#!/usr/bin/env python3
"""
Test API endpoint for debugging connectivity issues
"""

from flask import Flask, jsonify

def register_test_endpoints(app: Flask):
    """Register test API endpoints for connectivity debugging"""
    
    @app.route('/api/test', methods=['GET'])
    def test_api():
        """Simple test endpoint that returns JSON"""
        return jsonify({
            "status": "success", 
            "message": "Backend API connection successful!", 
            "service": "Podplay Sanctuary Backend"
        })

    @app.route('/api/mama-bear/test', methods=['GET', 'POST'])
    def mama_bear_test():
        """Test for mama-bear API path"""
        return jsonify({
            "status": "success", 
            "message": "Mama Bear API connection successful!", 
            "service": "Mama Bear API"
        })

    print("🧪 Test API endpoints registered")
    
    return app

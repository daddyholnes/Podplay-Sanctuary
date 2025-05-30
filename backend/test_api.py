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

    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint for monitoring"""
        return jsonify({
            "status": "healthy",
            "service": "Podplay Sanctuary Backend",
            "timestamp": "2025-05-30T00:00:00Z"
        })

    @app.route('/', methods=['GET'])
    def root():
        """Root endpoint"""
        return jsonify({
            "message": "Welcome to Podplay Sanctuary Backend",
            "status": "running",
            "service": "Podplay Sanctuary"
        })

    print("🧪 Test API endpoints registered")
    
    return app

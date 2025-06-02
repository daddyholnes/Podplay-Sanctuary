"""
Test script for the Integration Workbench API
"""
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Mock service for testing
class MockEnhancedMamaService:
    def store_knowledge(self, content, domain=None, source_url=None):
        print(f"Storing knowledge from {source_url}")
        return ["chunk1", "chunk2"]
    
    def create_workflow(self, description, steps=None):
        print(f"Creating workflow: {description}")
        return {"id": "wf123", "name": "Test Workflow", "status": "created"}
    
    def get_platforms(self):
        return [
            {"name": "Zapier", "icon": "zapier", "connected": True, "url": "https://zapier.com"},
            {"name": "GitHub", "icon": "github", "connected": False, "url": "https://github.com"},
            {"name": "Twitter", "icon": "twitter", "connected": True, "url": "https://twitter.com"},
            {"name": "Eden AI", "icon": "brain", "connected": False, "url": "https://edenai.co"},
            {"name": "n8n", "icon": "workflow", "connected": False, "url": "https://n8n.io"},
        ]
    
    def get_knowledge_sources(self):
        return [
            {"name": "React Documentation", "url": "https://reactjs.org/docs", "date_added": "2025-05-01"},
            {"name": "Flask Documentation", "url": "https://flask.palletsprojects.com", "date_added": "2025-05-15"},
            {"name": "Python Standard Library", "url": "https://docs.python.org/3/library", "date_added": "2025-05-20"},
        ]

class MockMarketplaceService:
    def get_platforms(self):
        return [
            {"id": "zapier", "name": "Zapier", "description": "Connect your apps and automate workflows"},
            {"id": "github", "name": "GitHub", "description": "World's leading developer platform"},
            {"id": "twitter", "name": "Twitter", "description": "Social network for news and discussions"},
            {"id": "edenai", "name": "Eden AI", "description": "Unified AI API platform"},
            {"id": "n8n", "name": "n8n", "description": "Fair-code licensed workflow automation tool"},
        ]

# Add a root route for testing
@app.route('/')
def index():
    return jsonify({
        "name": "Integration Workbench API",
        "status": "active",
        "endpoints": [
            "/api/integration/scrape",
            "/api/integration/platforms",
            "/api/integration/create-workflow",
            "/api/integration/knowledge-sources",
            "/api/integration/status"
        ]
    })

# Mock blueprint implementation
@app.route('/api/integration/scrape', methods=['POST'])
def scrape_url():
    return jsonify({
        "success": True,
        "message": "URL scraped successfully",
        "chunks": 5
    })

@app.route('/api/integration/platforms', methods=['GET'])
def list_platforms():
    enhanced_mama = MockEnhancedMamaService()
    return jsonify({
        "platforms": enhanced_mama.get_platforms()
    })

@app.route('/api/integration/create-workflow', methods=['POST'])
def create_workflow():
    return jsonify({
        "success": True,
        "workflow": {
            "id": "wf123",
            "name": "Email Notification Workflow",
            "description": "Send email notifications when new GitHub issues are created",
            "status": "active"
        }
    })

@app.route('/api/integration/knowledge-sources', methods=['GET'])
def list_knowledge_sources():
    enhanced_mama = MockEnhancedMamaService()
    return jsonify({
        "sources": enhanced_mama.get_knowledge_sources()
    })

@app.route('/api/integration/status', methods=['GET'])
def integration_status():
    return jsonify({
        "status": "active",
        "mama_bear_connected": True,
        "platforms_connected": 3,
        "knowledge_sources": 5,
        "workflows": 2
    })

if __name__ == '__main__':
    print("🔧 Starting Test Integration Workbench API")
    print("📡 API endpoints available at http://127.0.0.1:5000")
    app.run(debug=True)

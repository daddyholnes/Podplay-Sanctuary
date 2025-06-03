from flask import Blueprint, jsonify

integration_bp = Blueprint('integration', __name__)

@integration_bp.route('/api/integration/status', methods=['GET'])
def integration_status():
    return jsonify({"status": "ok", "service": "Integration Workbench"}), 200
from flask import Blueprint, request, jsonify
import logging
import requests
from urllib.parse import urlparse
import os
from datetime import datetime

logger = logging.getLogger(__name__)

integration_bp = Blueprint('integration', __name__, url_prefix='/api/integration')

# Globals to hold service references
enhanced_mama_service = None
marketplace_service = None

def init_integration_workbench(enhanced_mama, marketplace):
    """Initialize the integration workbench with required services"""
    global enhanced_mama_service, marketplace_service
    enhanced_mama_service = enhanced_mama
    marketplace_service = marketplace
    logger.info("Integration workbench initialized with enhanced MamaBear and marketplace services")
    return True

# Alias for test compatibility
initialize_integration_api = init_integration_workbench

@integration_bp.route('/scrape', methods=['POST'])
def scrape_url():
    """Scrape knowledge from a URL and store it in MamaBear's memory"""
    data = request.get_json()
    url = data.get('url')
    
    if not url:
        return jsonify({"error": "URL is required"}), 400
    
    try:
        # Validate URL
        parsed_url = urlparse(url)
        if not parsed_url.scheme or not parsed_url.netloc:
            return jsonify({"error": "Invalid URL"}), 400
        
        # Get content from URL
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        content = response.text
        
        # Extract domain for knowledge categorization
        domain = parsed_url.netloc
        
        # Check if enhanced_mama_service is available
        if enhanced_mama_service is None:
            return jsonify({"error": "MamaBear service not initialized"}), 500
        
        # Store in MamaBear's memory
        # This is a placeholder - actual implementation would depend on MamaBear's API
        chunks = enhanced_mama_service.store_knowledge(content, domain=domain, source_url=url)
        chunk_count = len(chunks) if chunks else 0
        
        return jsonify({
            "success": True,
            "message": f"Successfully scraped {url}",
            "chunks_stored": chunk_count,
            "domain": domain,
            "timestamp": datetime.utcnow().isoformat()
        })
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error scraping URL {url}: {str(e)}")
        return jsonify({"error": f"Failed to scrape URL: {str(e)}"}), 500
    except Exception as e:
        logger.error(f"Unexpected error processing {url}: {str(e)}")
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

@integration_bp.route('/platforms', methods=['GET'])
def list_platforms():
    """List available integration platforms"""
    platforms = [
        {
            "id": "zapier",
            "name": "Zapier",
            "icon": "zap",
            "status": "active" if os.getenv("ZAPIER_API_KEY") else "needs_setup",
            "description": "Connect with 5,000+ apps",
            "doc_url": "https://docs.zapier.com"
        },
        {
            "id": "eden_ai",
            "name": "Eden AI",
            "icon": "brain",
            "status": "active" if os.getenv("EDEN_AI_API_KEY") else "needs_setup",
            "description": "Unified AI API provider",
            "doc_url": "https://docs.edenai.co"
        },
        {
            "id": "n8n",
            "name": "n8n",
            "icon": "workflow",
            "status": "active" if os.getenv("N8N_API_URL") and os.getenv("N8N_API_KEY") else "needs_setup",
            "description": "Open source workflow automation",
            "doc_url": "https://docs.n8n.io"
        },
        {
            "id": "github",
            "name": "GitHub",
            "icon": "github",
            "status": "active" if os.getenv("GITHUB_TOKEN") else "needs_setup",
            "description": "Git repository hosting service",
            "doc_url": "https://docs.github.com"
        },
        {
            "id": "twitter",
            "name": "Twitter",
            "icon": "twitter",
            "status": "active" if os.getenv("TWITTER_BEARER_TOKEN") else "needs_setup",
            "description": "Social media platform",
            "doc_url": "https://developer.twitter.com/en/docs"
        }
    ]
    
    return jsonify({"platforms": platforms})

@integration_bp.route('/create-workflow', methods=['POST'])
def create_workflow():
    """Create a workflow from a natural language description"""
    data = request.get_json()
    description = data.get('description')
    platform = data.get('platform', 'auto')
    
    if not description:
        return jsonify({"error": "Workflow description is required"}), 400
    
    # Check if enhanced_mama_service is available
    if enhanced_mama_service is None:
        return jsonify({"error": "MamaBear service not initialized"}), 500
    
    try:
        # This would be a call to MamaBear's API to create a workflow
        # Placeholder implementation
        workflow_result = enhanced_mama_service.create_automation_workflow(
            description=description,
            preferred_platform=platform
        )
        
        return jsonify({
            "success": True,
            "workflow": workflow_result,
            "message": f"Successfully created workflow on {workflow_result.get('platform', platform)}",
            "timestamp": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error creating workflow: {str(e)}")
        return jsonify({"error": f"Failed to create workflow: {str(e)}"}), 500

@integration_bp.route('/platform-auth/<platform>', methods=['GET', 'POST'])
def platform_auth(platform):
    """Handle authentication for integration platforms"""
    if request.method == 'GET':
        # Return auth requirements/status for platform
        auth_info = {
            "platform": platform,
            "auth_type": "api_key",  # Or oauth, etc.
            "status": "authenticated" if os.getenv(f"{platform.upper()}_API_KEY") else "not_authenticated",
            "auth_url": None  # For OAuth flows
        }
        
        # Special handling for OAuth platforms
        if platform.lower() in ['twitter', 'github']:
            auth_info["auth_type"] = "oauth"
            auth_info["auth_url"] = f"/api/integration/oauth/{platform}"
        
        return jsonify(auth_info)
    
    elif request.method == 'POST':
        # Update auth credentials
        data = request.get_json()
        api_key = data.get('api_key')
        
        if not api_key:
            return jsonify({"error": "API key is required"}), 400
        
        # In production, you'd store this securely - not just in env var
        # This is just a placeholder
        os.environ[f"{platform.upper()}_API_KEY"] = api_key
        
        return jsonify({
            "success": True,
            "message": f"{platform} authentication updated successfully"
        })

@integration_bp.route('/knowledge-sources', methods=['GET'])
def list_knowledge_sources():
    """List knowledge sources that MamaBear has learned from"""
    # This would be integrated with MamaBear's knowledge store
    # Placeholder implementation
    sources = [
        {
            "domain": "docs.zapier.com",
            "url": "https://docs.zapier.com",
            "chunks": 1247,
            "last_updated": "2025-06-01T15:30:00Z",
            "status": "complete"
        },
        {
            "domain": "docs.edenai.co",
            "url": "https://docs.edenai.co",
            "chunks": 856,
            "last_updated": "2025-06-01T16:45:00Z",
            "status": "complete"
        }
    ]
    
    return jsonify({"sources": sources})

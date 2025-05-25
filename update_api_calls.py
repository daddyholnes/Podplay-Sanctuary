#!/usr/bin/env python3

import os
import re

def update_api_calls(directory):
    """
    Update all API calls from http://localhost:5000 to use the new API config
    """
    pattern = r'http://localhost:5000(/api/[a-zA-Z0-9-/_]+)'
    replacement = r'buildApiUrl(API_ENDPOINTS.\1)'
    
    # Special replacements for different API paths
    special_replacements = {
        r'http://localhost:5000/api/mama-bear/briefing': r'buildApiUrl(API_ENDPOINTS.MAMA_BEAR.BRIEFING)',
        r'http://localhost:5000/api/mama-bear/chat': r'buildApiUrl(API_ENDPOINTS.MAMA_BEAR.CHAT)',
        r'http://localhost:5000/api/mcp/manage': r'buildApiUrl(API_ENDPOINTS.MCP.MANAGE)',
        r'http://localhost:5000/api/mcp/search': r'buildApiUrl(API_ENDPOINTS.MCP.SEARCH)',
        r'http://localhost:5000/api/mcp/install': r'buildApiUrl(API_ENDPOINTS.MCP.INSTALL)',
        r'http://localhost:5000/api/mcp/categories': r'buildApiUrl(API_ENDPOINTS.MCP.CATEGORIES)',
        r'http://localhost:5000/api/mcp/discover': r'buildApiUrl(API_ENDPOINTS.MCP.DISCOVER)',
        r'http://localhost:5000/api/vertex-garden/chat': r'buildApiUrl(API_ENDPOINTS.VERTEX_GARDEN.CHAT)',
        r'http://localhost:5000/api/vertex-garden/chat-history': r'buildApiUrl(API_ENDPOINTS.VERTEX_GARDEN.CHAT_HISTORY)',
        r'http://localhost:5000/api/vertex-garden/terminal': r'buildApiUrl(API_ENDPOINTS.VERTEX_GARDEN.TERMINAL)',
        r'http://localhost:5000/api/vertex-garden/execute-code': r'buildApiUrl(API_ENDPOINTS.VERTEX_GARDEN.EXECUTE_CODE)',
    }
    
    # Pattern for dynamic session URLs
    session_pattern = r'http://localhost:5000/api/vertex-garden/session/([^/]+)/messages'
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                file_path = os.path.join(root, file)
                with open(file_path, 'r') as f:
                    content = f.read()
                
                # Apply special replacements first
                for old, new in special_replacements.items():
                    content = content.replace(old, new)
                
                # Handle dynamic session URLs
                content = re.sub(
                    session_pattern, 
                    r'buildDynamicApiUrl(API_ENDPOINTS.VERTEX_GARDEN.SESSION_MESSAGES, {sessionId: \1})',
                    content
                )
                
                # Update hardcoded localhost:5000 to use API_BASE_URL
                content = content.replace('http://localhost:5000', 'API_BASE_URL')
                
                # Write the updated content back
                with open(file_path, 'w') as f:
                    f.write(content)
                print(f"Updated {file_path}")

if __name__ == "__main__":
    frontend_dir = "/home/woody/Desktop/podplay-build-beta/frontend/src"
    update_api_calls(frontend_dir)
    print("✅ All API calls updated to use the new API configuration")

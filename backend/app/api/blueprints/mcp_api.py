from flask import Blueprint, jsonify

mcp_bp = Blueprint('mcp', __name__)

@mcp_bp.route('/api/mcp/search', methods=['GET'])
def mcp_search():
    return jsonify({"results": [], "status": "stub"})

from flask import Blueprint, jsonify

scout_bp = Blueprint('scout', __name__)

@scout_bp.route('/api/scout/status', methods=['GET'])
def scout_status():
    return jsonify({"status": "ok", "service": "Scout Agent"})

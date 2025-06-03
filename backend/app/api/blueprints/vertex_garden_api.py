from flask import Blueprint, jsonify

vertex_garden_bp = Blueprint('vertex_garden', __name__)

@vertex_garden_bp.route('/api/vertex-garden/status', methods=['GET'])
def status():
    return jsonify({"status": "ok", "service": "Vertex Garden"})

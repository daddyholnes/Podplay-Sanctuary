from flask import Blueprint, jsonify

control_center_bp = Blueprint('control_center', __name__)

@control_center_bp.route('/api/mama-bear/health', methods=['GET'])
def mama_bear_health():
    return jsonify({"status": "ok", "service": "Mama Bear Control Center"})

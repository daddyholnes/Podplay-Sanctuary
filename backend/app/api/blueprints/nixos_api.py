from flask import Blueprint, jsonify

nixos_bp = Blueprint('nixos', __name__)

@nixos_bp.route('/api/nixos/status', methods=['GET'])
def nixos_status():
    return jsonify({"status": "ok", "service": "NixOS"})

from flask import Blueprint, jsonify

devsandbox_bp = Blueprint('devsandbox', __name__)

@devsandbox_bp.route('/api/devsandbox/status', methods=['GET'])
def devsandbox_status():
    return jsonify({"status": "ok", "service": "DevSandbox"})

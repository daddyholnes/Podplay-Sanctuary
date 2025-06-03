from flask import Blueprint, jsonify

adk_workflow_bp = Blueprint('adk_workflow', __name__)

@adk_workflow_bp.route('/api/adk-workflow/status', methods=['GET'])
def adk_workflow_status():
    return jsonify({"status": "ok", "service": "ADK Workflow"})

def init_adk_workflow_services(app=None, mama_bear_service=None):
    # No-op stub for workflow service initialization
    pass

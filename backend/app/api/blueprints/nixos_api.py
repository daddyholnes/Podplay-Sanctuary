#!/usr/bin/env python3
"""
NixOS API Blueprint - NixOS workspace management
Temporary endpoints for frontend compatibility
"""

from flask import Blueprint, request, jsonify
import logging

logger = logging.getLogger(__name__)

nixos_bp = Blueprint('nixos', __name__, url_prefix='/api/nixos')

@nixos_bp.route('/workspaces', methods=['GET'])
def list_workspaces():
    """List NixOS workspaces - placeholder implementation"""
    try:
        return jsonify({
            "success": True,
            "workspaces": [
                {
                    "name": "development-workspace",
                    "status": "active",
                    "path": "/workspace/dev",
                    "created": "2025-05-30T09:00:00Z"
                },
                {
                    "name": "production-workspace", 
                    "status": "standby",
                    "path": "/workspace/prod",
                    "created": "2025-05-30T08:00:00Z"
                }
            ]
        })
    except Exception as e:
        logger.error(f"Error listing workspaces: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@nixos_bp.route('/workspaces/<workspace_name>', methods=['GET'])
def get_workspace(workspace_name):
    """Get workspace details"""
    try:
        return jsonify({
            "success": True,
            "workspace": {
                "name": workspace_name,
                "status": "active",
                "path": f"/workspace/{workspace_name}",
                "services": ["nginx", "postgresql", "redis"],
                "last_updated": "2025-05-30T09:00:00Z"
            }
        })
    except Exception as e:
        logger.error(f"Error getting workspace: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

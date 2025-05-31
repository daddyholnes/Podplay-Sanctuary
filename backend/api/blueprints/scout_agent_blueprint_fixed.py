#!/usr/bin/env python3
"""
Scout API Blueprint - Development workspace management
Temporary endpoints for frontend compatibility
"""

from flask import Blueprint, request, jsonify
import logging
import time
import psutil
import subprocess
import json
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

scout_bp = Blueprint('scout_agent', __name__, url_prefix='/api/v1/scout_agent')

@scout_bp.route('/projects/<project_name>/status', methods=['GET'])
def get_project_status(project_name):
    """Get project status - compatible with ScoutProjectStatusSummary interface"""
    try:
        # Return data in the format expected by frontend ScoutProjectStatusSummary
        status_summary = {
            "project_goal": f"Develop and maintain project: {project_name}",
            "project_overall_status": "running",
            "project_current_plan": [
                {
                    "id": "step_1",
                    "name": "Initialize Development Environment",
                    "status": "completed"
                },
                {
                    "id": "step_2", 
                    "name": "Set Up Project Structure",
                    "status": "active"
                },
                {
                    "id": "step_3",
                    "name": "Implement Core Features",
                    "status": "pending"
                },
                {
                    "id": "step_4",
                    "name": "Testing & Deployment",
                    "status": "pending"
                }
            ],
            "project_active_step_id": "step_2",
            "project_associated_workspace_id": f"workspace_{project_name}",
            "recent_logs": [
                {
                    "log_id": "log_001",
                    "timestamp": datetime.now().isoformat(),
                    "message": f"Project {project_name} status check completed",
                    "step_id": "step_2",
                    "step_name": "Set Up Project Structure",
                    "agent_action": "status_check",
                    "status_update": "Project structure is being organized",
                    "is_error": False
                },
                {
                    "log_id": "log_002", 
                    "timestamp": (datetime.now() - timedelta(minutes=5)).isoformat(),
                    "message": "Development environment initialized successfully",
                    "step_id": "step_1",
                    "step_name": "Initialize Development Environment",
                    "agent_action": "environment_setup",
                    "status_update": "Environment ready for development",
                    "is_error": False
                }
            ]
        }
        
        return jsonify({
            "success": True,
            "status_summary": status_summary
        })
    except Exception as e:
        logger.error(f"Error getting project status: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@scout_bp.route('/projects', methods=['GET'])
def list_projects():
    """List all projects"""
    try:
        return jsonify({
            "success": True,
            "projects": [
                {
                    "name": "test-project-alpha",
                    "status": "active",
                    "created": "2025-05-30T09:00:00Z"
                }
            ]
        })
    except Exception as e:
        logger.error(f"Error listing projects: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@scout_bp.route('/system/metrics', methods=['GET'])
def get_system_metrics():
    """Get comprehensive system performance metrics"""
    try:
        # CPU metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        cpu_count = psutil.cpu_count()
        cpu_freq = psutil.cpu_freq()
        
        # Memory metrics
        memory = psutil.virtual_memory()
        swap = psutil.swap_memory()
        
        # Disk metrics
        disk = psutil.disk_usage('/')
        disk_io = psutil.disk_io_counters()
        
        # Network metrics
        network = psutil.net_io_counters()
        
        # Process information
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
            try:
                processes.append(proc.info)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        
        # Sort by CPU usage and take top 10
        top_processes = sorted(processes, key=lambda x: x['cpu_percent'] or 0, reverse=True)[:10]
        
        metrics = {
            'timestamp': time.time(),
            'cpu': {
                'percent': cpu_percent,
                'count': cpu_count,
                'frequency': {
                    'current': cpu_freq.current if cpu_freq else None,
                    'min': cpu_freq.min if cpu_freq else None,
                    'max': cpu_freq.max if cpu_freq else None
                }
            },
            'memory': {
                'total': memory.total,
                'available': memory.available,
                'percent': memory.percent,
                'used': memory.used,
                'free': memory.free
            },
            'swap': {
                'total': swap.total,
                'used': swap.used,
                'free': swap.free,
                'percent': swap.percent
            },
            'disk': {
                'total': disk.total,
                'used': disk.used,
                'free': disk.free,
                'percent': (disk.used / disk.total) * 100 if disk.total > 0 else 0,
                'io': {
                    'read_bytes': disk_io.read_bytes if disk_io else 0,
                    'write_bytes': disk_io.write_bytes if disk_io else 0,
                    'read_count': disk_io.read_count if disk_io else 0,
                    'write_count': disk_io.write_count if disk_io else 0
                }
            },
            'network': {
                'bytes_sent': network.bytes_sent,
                'bytes_recv': network.bytes_recv,
                'packets_sent': network.packets_sent,
                'packets_recv': network.packets_recv
            },
            'top_processes': top_processes
        }
        
        return jsonify({
            'status': 'success',
            'metrics': metrics
        })
        
    except Exception as e:
        logger.error(f"Error getting system metrics: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@scout_bp.route('/services/status', methods=['GET'])
def get_services_status():
    """Get status of all managed services"""
    try:
        services = [
            {
                'name': 'mama-bear-api',
                'status': 'running',
                'port': 5000,
                'pid': 12345,
                'cpu_percent': 2.5,
                'memory_mb': 256,
                'uptime': time.time() - 86400,
                'last_restart': time.time() - 86400,
                'health_check': {
                    'url': 'http://localhost:5000/health',
                    'status': 'healthy',
                    'response_time': 45
                }
            },
            {
                'name': 'vertex-ai-service',
                'status': 'running',
                'port': 8080,
                'pid': 12346,
                'cpu_percent': 1.8,
                'memory_mb': 512,
                'uptime': time.time() - 172800,
                'last_restart': time.time() - 172800,
                'health_check': {
                    'url': 'http://localhost:8080/health',
                    'status': 'healthy',
                    'response_time': 62
                }
            },
            {
                'name': 'postgresql',
                'status': 'running',
                'port': 5432,
                'pid': 12347,
                'cpu_percent': 0.5,
                'memory_mb': 128,
                'uptime': time.time() - 259200,
                'last_restart': time.time() - 259200,
                'health_check': {
                    'url': 'postgresql://localhost:5432',
                    'status': 'healthy',
                    'response_time': 12
                }
            },
            {
                'name': 'redis',
                'status': 'running',
                'port': 6379,
                'pid': 12348,
                'cpu_percent': 0.2,
                'memory_mb': 64,
                'uptime': time.time() - 345600,
                'last_restart': time.time() - 345600,
                'health_check': {
                    'url': 'redis://localhost:6379',
                    'status': 'healthy',
                    'response_time': 8
                }
            },
            {
                'name': 'socketio-server',
                'status': 'running',
                'port': 3001,
                'pid': 12349,
                'cpu_percent': 1.2,
                'memory_mb': 192,
                'uptime': time.time() - 43200,
                'last_restart': time.time() - 43200,
                'health_check': {
                    'url': 'http://localhost:3001/socket.io/',
                    'status': 'healthy',
                    'response_time': 28
                }
            }
        ]
        
        # Calculate overall health
        healthy_services = sum(1 for s in services if s['health_check']['status'] == 'healthy')
        overall_health = 'healthy' if healthy_services == len(services) else 'degraded'
        
        return jsonify({
            'status': 'success',
            'services': services,
            'summary': {
                'total_services': len(services),
                'healthy_services': healthy_services,
                'overall_health': overall_health
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting services status: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

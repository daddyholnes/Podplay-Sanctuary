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

logger = logging.getLogger(__name__)

scout_bp = Blueprint('scout_agent', __name__, url_prefix='/api/v1/scout_agent')

@scout_bp.route('/projects/<project_name>/status', methods=['GET'])
def get_project_status(project_name):
    """Get project status - compatible with ScoutProjectStatusSummary interface"""    try:
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

@scout_bp.route('/logs/tail', methods=['GET'])
def tail_logs():
    """Get recent log entries from all services"""
    try:
        service = request.args.get('service', 'all')
        lines = int(request.args.get('lines', 100))
        level = request.args.get('level', 'all')
        
        # Mock log entries from various services
        all_logs = [
            {
                'timestamp': time.time() - 3600,
                'service': 'mama-bear-api',
                'level': 'info',
                'message': 'Successfully processed chat request from user nathan',
                'request_id': 'req_12345'
            },
            {
                'timestamp': time.time() - 3550,
                'service': 'vertex-ai-service',
                'level': 'info',
                'message': 'Gemini model response received in 1.2s',
                'model': 'gemini-2.5-flash-002'
            },
            {
                'timestamp': time.time() - 3500,
                'service': 'postgresql',
                'level': 'debug',
                'message': 'Query executed: SELECT * FROM chat_sessions WHERE user_id = $1',
                'duration': '15ms'
            },
            {
                'timestamp': time.time() - 3400,
                'service': 'socketio-server',
                'level': 'info',
                'message': 'Client connected from 127.0.0.1',
                'client_id': 'client_abc123'
            },
            {
                'timestamp': time.time() - 1800,
                'service': 'mama-bear-api',
                'level': 'warn',
                'message': 'High response time detected: 3.5s',
                'endpoint': '/api/chat/mama-bear'
            },
            {
                'timestamp': time.time() - 900,
                'service': 'vertex-ai-service',
                'level': 'error',
                'message': 'Temporary API quota limit reached, falling back to secondary model',
                'quota_type': 'requests_per_minute'
            }
        ]
        
        # Filter by service
        if service != 'all':
            all_logs = [log for log in all_logs if log['service'] == service]
        
        # Filter by level
        if level != 'all':
            all_logs = [log for log in all_logs if log['level'] == level]
        
        # Sort by timestamp (newest first) and apply limit
        logs = sorted(all_logs, key=lambda x: x['timestamp'], reverse=True)[:lines]
        
        return jsonify({
            'status': 'success',
            'logs': logs,
            'total_entries': len(logs),
            'filters': {
                'service': service,
                'level': level,
                'lines': lines
            }
        })
        
    except Exception as e:
        logger.error(f"Error tailing logs: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@scout_bp.route('/alerts', methods=['GET'])
def get_alerts():
    """Get current system alerts and warnings"""
    try:
        # Mock alert data
        alerts = [
            {
                'id': 'alert_001',
                'severity': 'warning',
                'title': 'High Memory Usage',
                'message': 'System memory usage is at 85%',
                'service': 'system',
                'timestamp': time.time() - 1800,
                'status': 'active',
                'threshold': 80,
                'current_value': 85
            },
            {
                'id': 'alert_002',
                'severity': 'info',
                'title': 'API Quota Warning',
                'message': 'Vertex AI API quota is 75% consumed',
                'service': 'vertex-ai-service',
                'timestamp': time.time() - 3600,
                'status': 'active',
                'threshold': 70,
                'current_value': 75
            },
            {
                'id': 'alert_003',
                'severity': 'critical',
                'title': 'Service Response Time',
                'message': 'Mama Bear API response time exceeded 5 seconds',
                'service': 'mama-bear-api',
                'timestamp': time.time() - 900,
                'status': 'resolved',
                'threshold': 3000,
                'current_value': 5200
            }
        ]
        
        # Filter by status if provided
        status_filter = request.args.get('status')
        if status_filter:
            alerts = [alert for alert in alerts if alert['status'] == status_filter]
        
        # Count by severity
        severity_counts = {}
        for alert in alerts:
            severity = alert['severity']
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
        
        return jsonify({
            'status': 'success',
            'alerts': alerts,
            'summary': {
                'total_alerts': len(alerts),
                'severity_counts': severity_counts
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting alerts: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@scout_bp.route('/deployment/status', methods=['GET'])
def get_deployment_status():
    """Get current deployment status and version information"""
    try:
        deployment_info = {
            'environment': 'development',
            'version': '1.0.0-beta',
            'build_number': '12345',
            'git_commit': 'abc123def456',
            'deployed_at': time.time() - 86400,
            'deployment_duration': 45,
            'status': 'stable',
            'components': [
                {
                    'name': 'backend-api',
                    'version': '1.0.0',
                    'status': 'healthy',
                    'instances': 1,
                    'last_deployed': time.time() - 86400
                },
                {
                    'name': 'frontend-app',
                    'version': '1.0.0',
                    'status': 'healthy',
                    'instances': 1,
                    'last_deployed': time.time() - 86400
                },
                {
                    'name': 'vertex-ai-service',
                    'version': '2.1.0',
                    'status': 'healthy',
                    'instances': 1,
                    'last_deployed': time.time() - 172800
                }
            ],
            'health_checks': {
                'api_endpoints': 15,
                'passing': 15,
                'failing': 0,
                'last_check': time.time() - 300
            }
        }
        
        return jsonify({
            'status': 'success',
            'deployment': deployment_info
        })
        
    except Exception as e:
        logger.error(f"Error getting deployment status: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@scout_bp.route('/performance/analytics', methods=['GET'])
def get_performance_analytics():
    """Get performance analytics and trends"""
    try:
        timeframe = request.args.get('timeframe', '24h')
        
        # Mock performance data
        analytics = {
            'timeframe': timeframe,
            'api_performance': {
                'total_requests': 12847,
                'avg_response_time': 245,
                'p95_response_time': 850,
                'p99_response_time': 1200,
                'error_rate': 0.012,
                'throughput': 35.7  # requests per second
            },
            'ai_model_performance': {
                'vertex_ai': {
                    'total_requests': 3456,
                    'avg_response_time': 1200,
                    'success_rate': 0.98,
                    'quota_usage': 0.75
                },
                'adk_models': {
                    'total_requests': 1234,
                    'avg_response_time': 1800,
                    'success_rate': 0.97,
                    'quota_usage': 0.60
                }
            },
            'system_trends': {
                'cpu_usage': [45, 52, 48, 55, 42, 38, 44],  # Last 7 data points
                'memory_usage': [68, 72, 75, 78, 74, 69, 71],
                'disk_usage': [45, 45, 46, 46, 47, 47, 48],
                'network_io': [125, 150, 135, 180, 145, 120, 160]  # MB/s
            },
            'user_activity': {
                'active_sessions': 23,
                'chat_sessions': 18,
                'api_calls_per_hour': 156,
                'unique_users': 8
            }
        }
        
        return jsonify({
            'status': 'success',
            'analytics': analytics,
            'generated_at': time.time()
        })
        
    except Exception as e:
        logger.error(f"Error getting performance analytics: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@scout_bp.route('/monitoring/configure', methods=['POST'])
def configure_monitoring():
    """Configure monitoring settings and thresholds"""
    try:
        data = request.get_json()
        
        config = {
            'alerts': {
                'cpu_threshold': data.get('cpu_threshold', 80),
                'memory_threshold': data.get('memory_threshold', 85),
                'disk_threshold': data.get('disk_threshold', 90),
                'response_time_threshold': data.get('response_time_threshold', 3000)
            },
            'notifications': {
                'email_enabled': data.get('email_enabled', True),
                'slack_enabled': data.get('slack_enabled', False),
                'webhook_url': data.get('webhook_url')
            },
            'retention': {
                'logs_days': data.get('logs_days', 30),
                'metrics_days': data.get('metrics_days', 90)
            }
        }
        
        return jsonify({
            'status': 'success',
            'message': 'Monitoring configuration updated',
            'config': config
        })
        
    except Exception as e:
        logger.error(f"Error configuring monitoring: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

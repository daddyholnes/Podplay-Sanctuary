# Gunicorn configuration for Google Cloud Run
import os

# Server socket
bind = f"0.0.0.0:{os.getenv('PORT', '8080')}"
backlog = 2048

# Worker processes
worker_class = "eventlet"
worker_connections = 1000
workers = 1  # Single worker for Cloud Run
threads = 1

# Restart workers after this many requests, to help avoid memory leaks
max_requests = 1000
max_requests_jitter = 50

# Timeout for graceful workers restart
timeout = 120
keepalive = 5

# Logging
loglevel = "info"
accesslog = "-"
errorlog = "-"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = "mama-bear-backend"

# Server mechanics
daemon = False
pidfile = None
user = None
group = None
tmp_upload_dir = None

# SSL (handled by Cloud Run)
keyfile = None
certfile = None

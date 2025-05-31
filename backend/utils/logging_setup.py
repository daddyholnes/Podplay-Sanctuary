"""
Centralized logging configuration for Podplay Sanctuary
Handles UTF-8 encoding and consistent formatting across all modules
"""

import logging
import sys
import os
from logging.handlers import RotatingFileHandler

def setup_logging(app):
    """
    Configure centralized logging with UTF-8 support and proper formatting
    
    Args:
        app: Flask application instance
    """
    log_level = getattr(logging, app.config.get('LOG_LEVEL', 'INFO').upper())
    log_file = app.config.get('LOG_FILE', 'mama_bear.log')
    
    # Create formatter with Mama Bear branding
    log_format = '🐻 Mama Bear: %(asctime)s - %(name)s - %(levelname)s - %(message)s'
    formatter = logging.Formatter(log_format)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Clear existing handlers
    root_logger.handlers.clear()
    
    # File handler with UTF-8 encoding and rotation
    file_handler = RotatingFileHandler(
        log_file, 
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(log_level)
    root_logger.addHandler(file_handler)
    
    # Console handler with UTF-8 encoding
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(log_level)
    
    # Handle Windows console encoding
    if hasattr(console_handler.stream, 'reconfigure'):
        try:
            console_handler.stream.reconfigure(encoding='utf-8')
        except:
            # Fallback formatter without emojis for Windows compatibility
            plain_formatter = logging.Formatter(
                'Mama Bear: %(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            console_handler.setFormatter(plain_formatter)
    
    root_logger.addHandler(console_handler)
    
    # Configure specific loggers
    logging.getLogger('socketio').setLevel(logging.DEBUG if app.config.get('DEBUG') else logging.WARNING)
    logging.getLogger('engineio').setLevel(logging.DEBUG if app.config.get('DEBUG') else logging.WARNING)
    logging.getLogger('werkzeug').setLevel(logging.WARNING)
    
    app.logger.info("Logging system initialized successfully")

def get_logger(name):
    """
    Get a logger instance with consistent configuration
    
    Args:
        name: Logger name (typically __name__)
        
    Returns:
        Configured logger instance
    """
    return logging.getLogger(name)
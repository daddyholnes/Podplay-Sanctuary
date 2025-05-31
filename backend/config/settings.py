"""
Configuration management for Podplay Sanctuary Backend
Centralized environment configuration with clean separation
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env.local'))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))

class Config:
    """Base configuration class"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Database configuration
    DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///sanctuary.db'
    
    # MCP Configuration
    MCP_DISCOVERY_ENABLED = os.environ.get('MCP_DISCOVERY_ENABLED', 'True').lower() == 'true'
    
    # External API Keys
    MEM0_API_KEY = os.environ.get('MEM0_API_KEY')
    MEM0_USER_ID = os.environ.get('MEM0_USER_ID', 'nathan_sanctuary')
    TOGETHER_AI_API_KEY = os.environ.get('TOGETHER_AI_API_KEY')
    TOGETHER_AI_MODEL = os.environ.get('TOGETHER_AI_MODEL', 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo')
    TOGETHER_AI_MAX_TOKENS = int(os.environ.get('TOGETHER_AI_MAX_TOKENS', '4096'))
    TOGETHER_AI_TEMPERATURE = float(os.environ.get('TOGETHER_AI_TEMPERATURE', '0.7'))
    
    # Google Cloud Configuration
    GOOGLE_APPLICATION_CREDENTIALS = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
    VERTEX_AI_PROJECT = os.environ.get('VERTEX_AI_PROJECT')
    VERTEX_AI_LOCATION = os.environ.get('VERTEX_AI_LOCATION', 'us-central1')
    
    # NixOS Infrastructure
    NIXOS_INFRASTRUCTURE_ENABLED = os.environ.get('NIXOS_INFRASTRUCTURE_ENABLED', 'False').lower() == 'true'
    
    # Logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = os.environ.get('LOG_FILE', 'mama_bear.log')
    
    # Socket.IO Configuration
    SOCKETIO_ASYNC_MODE = os.environ.get('SOCKETIO_ASYNC_MODE', 'threading')
    SOCKETIO_PING_TIMEOUT = int(os.environ.get('SOCKETIO_PING_TIMEOUT', '60'))
    SOCKETIO_PING_INTERVAL = int(os.environ.get('SOCKETIO_PING_INTERVAL', '25'))

class DevelopmentConfig(Config):
    """Development environment configuration"""
    DEBUG = True
    ENV = 'development'
    
    # Enable all optional features in development
    MCP_DISCOVERY_ENABLED = True
    NIXOS_INFRASTRUCTURE_ENABLED = True

class ProductionConfig(Config):
    """Production environment configuration"""
    DEBUG = False
    ENV = 'production'
    
    # Use environment variables for sensitive configuration
    SECRET_KEY = os.environ.get('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY environment variable must be set in production")

class TestingConfig(Config):
    """Testing environment configuration"""
    TESTING = True
    DEBUG = True
    ENV = 'testing'
    
    # Use in-memory database for testing
    DATABASE_URL = 'sqlite:///:memory:'
    
    # Disable external services in testing
    MCP_DISCOVERY_ENABLED = False
    NIXOS_INFRASTRUCTURE_ENABLED = False

def get_config(config_name):
    """
    Get configuration class based on environment name
    
    Args:
        config_name: Environment name (development, production, testing)
        
    Returns:
        Configuration class instance
    """
    config_map = {
        'development': DevelopmentConfig,
        'production': ProductionConfig,
        'testing': TestingConfig
    }
    
    return config_map.get(config_name, DevelopmentConfig)
"""
Configuration settings for Podplay Sanctuary
"""
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
base_dir = Path(__file__).parent.parent.parent
load_dotenv(base_dir / '.env.local')
load_dotenv(base_dir / '.env')

class Config:
    """Base configuration class"""
    
    # Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    # Database settings
    DATABASE_PATH = os.getenv('DATABASE_PATH', str(base_dir / 'sanctuary.db'))
    
    # Socket.IO settings
    SOCKETIO_CORS_ALLOWED_ORIGINS = os.getenv('SOCKETIO_CORS_ALLOWED_ORIGINS', '*')
    
    # External service settings
    GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    TOGETHER_API_KEY = os.getenv('TOGETHER_API_KEY')
    MEM0_API_KEY = os.getenv('MEM0_API_KEY')
    
    # Google Cloud settings
    GOOGLE_APPLICATION_CREDENTIALS = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    GOOGLE_CLOUD_PROJECT = os.getenv('GOOGLE_CLOUD_PROJECT')
    GOOGLE_CLOUD_LOCATION = os.getenv('GOOGLE_CLOUD_LOCATION', 'us-central1')
    
    # Feature flags
    MCP_DISCOVERY_ENABLED = os.getenv('MCP_DISCOVERY_ENABLED', 'True').lower() == 'true'
    VERTEX_AI_ENABLED = bool(GOOGLE_APPLICATION_CREDENTIALS and GOOGLE_CLOUD_PROJECT)
    MEM0_ENABLED = bool(MEM0_API_KEY)
    TOGETHER_AI_ENABLED = bool(TOGETHER_API_KEY)
    
    # Data paths
    MCP_SERVERS_DATA_PATH = Path(__file__).parent.parent / 'data' / 'mcp_servers.json'

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    
class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Get configuration based on environment"""
    env = os.getenv('FLASK_ENV', 'default')
    return config.get(env, config['default'])

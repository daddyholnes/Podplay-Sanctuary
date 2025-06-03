import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration class"""
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-please-change')
    UPLOADS_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'uploads')
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'mp3', 'mp4', 'wav', 'ogg'}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload
    
    # API Keys
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')
    ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY')
    TOGETHERAI_API_KEY = os.environ.get('TOGETHERAI_API_KEY')
    
    # Service Account Paths
    GOOGLE_APPLICATION_CREDENTIALS = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')

    # Database Path (added for factory compatibility)
    DATABASE_PATH = os.environ.get('DATABASE_PATH', os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'data', 'sanctuary.db'))
    MCP_SERVERS_DATA_PATH = os.environ.get('MCP_SERVERS_DATA_PATH', os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'data', 'mcp_servers'))

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    # Production-specific settings
    pass

def get_config():
    """Return the appropriate configuration object based on the environment"""
    config_type = os.environ.get('FLASK_ENV', 'development').lower()
    
    if config_type == 'production':
        return ProductionConfig()
    elif config_type == 'testing':
        return TestingConfig()
    else:
        return DevelopmentConfig()

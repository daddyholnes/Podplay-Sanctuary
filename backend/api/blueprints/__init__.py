# API Blueprints module
from .socket_handlers import register_socket_handlers
from ..api_blueprints import register_blueprints

__all__ = ['register_socket_handlers', 'register_blueprints']

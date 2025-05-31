"""
Global Error Handlers

Provides centralized error handling and consistent error responses across the
Podplay Sanctuary platform with detailed logging and user-friendly messages.
"""

from flask import Flask, jsonify, request
from werkzeug.exceptions import HTTPException
from datetime import datetime
import traceback

from utils.logging_setup import get_logger

logger = get_logger(__name__)

def register_error_handlers(app: Flask):
    """
    Register global error handlers with the Flask application
    
    Args:
        app: Flask application instance
    """
    
    @app.errorhandler(400)
    def handle_bad_request(error):
        """Handle 400 Bad Request errors"""
        error_details = {
            "error": "Bad Request",
            "message": "The request contains invalid parameters or malformed data",
            "status_code": 400,
            "timestamp": datetime.now().isoformat(),
            "endpoint": request.endpoint,
            "method": request.method
        }
        
        logger.warning(f"Bad request on {request.endpoint}: {error}")
        return jsonify(error_details), 400
    
    @app.errorhandler(401)
    def handle_unauthorized(error):
        """Handle 401 Unauthorized errors"""
        error_details = {
            "error": "Unauthorized",
            "message": "Authentication required or authentication failed",
            "status_code": 401,
            "timestamp": datetime.now().isoformat(),
            "endpoint": request.endpoint
        }
        
        logger.warning(f"Unauthorized access attempt on {request.endpoint}")
        return jsonify(error_details), 401
    
    @app.errorhandler(403)
    def handle_forbidden(error):
        """Handle 403 Forbidden errors"""
        error_details = {
            "error": "Forbidden",
            "message": "Access denied - insufficient permissions",
            "status_code": 403,
            "timestamp": datetime.now().isoformat(),
            "endpoint": request.endpoint
        }
        
        logger.warning(f"Forbidden access attempt on {request.endpoint}")
        return jsonify(error_details), 403
    
    @app.errorhandler(404)
    def handle_not_found(error):
        """Handle 404 Not Found errors"""
        error_details = {
            "error": "Not Found",
            "message": f"The requested resource '{request.path}' was not found",
            "status_code": 404,
            "timestamp": datetime.now().isoformat(),
            "available_endpoints": _get_available_endpoints(app) if app.config.get('DEBUG') else None
        }
        
        logger.info(f"404 error for path: {request.path}")
        return jsonify(error_details), 404
    
    @app.errorhandler(405)
    def handle_method_not_allowed(error):
        """Handle 405 Method Not Allowed errors"""
        error_details = {
            "error": "Method Not Allowed",
            "message": f"Method '{request.method}' is not allowed for this endpoint",
            "status_code": 405,
            "timestamp": datetime.now().isoformat(),
            "endpoint": request.endpoint,
            "allowed_methods": list(error.valid_methods) if hasattr(error, 'valid_methods') else []
        }
        
        logger.warning(f"Method {request.method} not allowed on {request.endpoint}")
        return jsonify(error_details), 405
    
    @app.errorhandler(413)
    def handle_payload_too_large(error):
        """Handle 413 Payload Too Large errors"""
        error_details = {
            "error": "Payload Too Large",
            "message": "The request payload exceeds the maximum allowed size",
            "status_code": 413,
            "timestamp": datetime.now().isoformat(),
            "max_size": "10MB"
        }
        
        logger.warning(f"Payload too large on {request.endpoint}")
        return jsonify(error_details), 413
    
    @app.errorhandler(422)
    def handle_unprocessable_entity(error):
        """Handle 422 Unprocessable Entity errors"""
        error_details = {
            "error": "Unprocessable Entity",
            "message": "The request data is valid but cannot be processed",
            "status_code": 422,
            "timestamp": datetime.now().isoformat(),
            "endpoint": request.endpoint
        }
        
        logger.warning(f"Unprocessable entity on {request.endpoint}: {error}")
        return jsonify(error_details), 422
    
    @app.errorhandler(429)
    def handle_rate_limit_exceeded(error):
        """Handle 429 Too Many Requests errors"""
        error_details = {
            "error": "Rate Limit Exceeded",
            "message": "Too many requests. Please slow down and try again later",
            "status_code": 429,
            "timestamp": datetime.now().isoformat(),
            "retry_after": "60 seconds"
        }
        
        logger.warning(f"Rate limit exceeded from {request.remote_addr}")
        return jsonify(error_details), 429
    
    @app.errorhandler(500)
    def handle_internal_server_error(error):
        """Handle 500 Internal Server Error"""
        error_id = f"ERR-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        
        error_details = {
            "error": "Internal Server Error",
            "message": "An unexpected error occurred while processing your request",
            "status_code": 500,
            "timestamp": datetime.now().isoformat(),
            "error_id": error_id,
            "support_message": "If this problem persists, please contact support with the error ID"
        }
        
        # Log detailed error information
        logger.error(f"Internal server error [{error_id}]: {error}")
        logger.error(f"Request details: {request.method} {request.path}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        
        return jsonify(error_details), 500
    
    @app.errorhandler(502)
    def handle_bad_gateway(error):
        """Handle 502 Bad Gateway errors"""
        error_details = {
            "error": "Bad Gateway",
            "message": "Error communicating with external services",
            "status_code": 502,
            "timestamp": datetime.now().isoformat(),
            "suggestion": "Please try again in a few moments"
        }
        
        logger.error(f"Bad gateway error: {error}")
        return jsonify(error_details), 502
    
    @app.errorhandler(503)
    def handle_service_unavailable(error):
        """Handle 503 Service Unavailable errors"""
        error_details = {
            "error": "Service Unavailable",
            "message": "The service is temporarily unavailable",
            "status_code": 503,
            "timestamp": datetime.now().isoformat(),
            "suggestion": "Please try again later"
        }
        
        logger.error(f"Service unavailable: {error}")
        return jsonify(error_details), 503
    
    @app.errorhandler(HTTPException)
    def handle_generic_http_exception(error):
        """Handle generic HTTP exceptions"""
        error_details = {
            "error": error.name,
            "message": error.description,
            "status_code": error.code,
            "timestamp": datetime.now().isoformat(),
            "endpoint": request.endpoint
        }
        
        logger.warning(f"HTTP exception {error.code} on {request.endpoint}: {error.description}")
        return jsonify(error_details), error.code
    
    @app.errorhandler(Exception)
    def handle_generic_exception(error):
        """Handle all other unhandled exceptions"""
        error_id = f"ERR-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        
        error_details = {
            "error": "Unexpected Error",
            "message": "An unexpected error occurred",
            "status_code": 500,
            "timestamp": datetime.now().isoformat(),
            "error_id": error_id,
            "error_type": type(error).__name__
        }
        
        # Log full error details
        logger.error(f"Unhandled exception [{error_id}]: {type(error).__name__}: {error}")
        logger.error(f"Request: {request.method} {request.path}")
        logger.error(f"Full traceback: {traceback.format_exc()}")
        
        return jsonify(error_details), 500

class APIError(Exception):
    """Custom API error class for controlled error responses"""
    
    def __init__(self, message: str, status_code: int = 400, error_code: str = None, details: dict = None):
        """
        Initialize API error
        
        Args:
            message: Error message
            status_code: HTTP status code
            error_code: Custom error code for client handling
            details: Additional error details
        """
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details or {}
        self.timestamp = datetime.now().isoformat()
    
    def to_dict(self) -> dict:
        """Convert error to dictionary for JSON response"""
        error_dict = {
            "error": self.error_code or "API Error",
            "message": self.message,
            "status_code": self.status_code,
            "timestamp": self.timestamp
        }
        
        if self.details:
            error_dict["details"] = self.details
        
        return error_dict

class ValidationError(APIError):
    """Validation-specific error class"""
    
    def __init__(self, message: str, field_errors: dict = None):
        super().__init__(message, status_code=400, error_code="VALIDATION_ERROR")
        if field_errors:
            self.details["field_errors"] = field_errors

class ServiceUnavailableError(APIError):
    """Service unavailability error class"""
    
    def __init__(self, service_name: str, message: str = None):
        default_message = f"{service_name} service is currently unavailable"
        super().__init__(
            message or default_message,
            status_code=503,
            error_code="SERVICE_UNAVAILABLE"
        )
        self.details["service"] = service_name

class ConfigurationError(APIError):
    """Configuration-related error class"""
    
    def __init__(self, message: str, config_key: str = None):
        super().__init__(message, status_code=500, error_code="CONFIGURATION_ERROR")
        if config_key:
            self.details["configuration_key"] = config_key

def _get_available_endpoints(app: Flask) -> list:
    """
    Get list of available endpoints for debugging
    
    Args:
        app: Flask application instance
        
    Returns:
        List of available endpoint information
    """
    endpoints = []
    for rule in app.url_map.iter_rules():
        endpoints.append({
            "endpoint": rule.rule,
            "methods": list(rule.methods - {'HEAD', 'OPTIONS'})
        })
    return sorted(endpoints, key=lambda x: x['endpoint'])

def log_request_info():
    """Log detailed request information for debugging"""
    logger.debug(f"Request: {request.method} {request.path}")
    logger.debug(f"Headers: {dict(request.headers)}")
    logger.debug(f"Args: {dict(request.args)}")
    if request.is_json:
        logger.debug(f"JSON: {request.get_json()}")

def create_error_response(error: APIError) -> tuple:
    """
    Create standardized error response
    
    Args:
        error: APIError instance
        
    Returns:
        Tuple of (response_dict, status_code)
    """
    return jsonify(error.to_dict()), error.status_code
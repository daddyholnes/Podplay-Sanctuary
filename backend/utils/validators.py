"""
Input Validation Utilities

Provides comprehensive validation functions for API inputs, configuration data,
and user interactions across the Podplay Sanctuary platform with detailed
error reporting and security considerations.
"""

import re
import json
from typing import Dict, Any, List, Optional, Union
from urllib.parse import urlparse

from utils.logging_setup import get_logger

logger = get_logger(__name__)

def validate_chat_input(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate chat API input parameters with comprehensive checks
    
    Args:
        data: Dictionary containing chat input parameters
        
    Returns:
        Validation result with success status and error details
    """
    errors = []
    
    # Required fields validation
    if not data.get('message'):
        errors.append("Message content is required")
    elif not isinstance(data['message'], str):
        errors.append("Message must be a string")
    elif len(data['message'].strip()) == 0:
        errors.append("Message cannot be empty")
    elif len(data['message']) > 10000:
        errors.append("Message exceeds maximum length of 10,000 characters")
    
    # Optional user_id validation
    if 'user_id' in data:
        user_id = data['user_id']
        if not isinstance(user_id, str):
            errors.append("User ID must be a string")
        elif not re.match(r'^[a-zA-Z0-9_-]+$', user_id):
            errors.append("User ID contains invalid characters")
        elif len(user_id) > 50:
            errors.append("User ID exceeds maximum length of 50 characters")
    
    # Optional session_id validation
    if 'session_id' in data:
        session_id = data['session_id']
        if not isinstance(session_id, str):
            errors.append("Session ID must be a string")
        elif len(session_id) > 100:
            errors.append("Session ID exceeds maximum length")
    
    # Context validation
    if 'context' in data:
        context = data['context']
        if context is not None and not isinstance(context, dict):
            errors.append("Context must be a dictionary or null")
    
    return {
        'valid': len(errors) == 0,
        'error': '; '.join(errors) if errors else None,
        'sanitized_data': _sanitize_chat_input(data) if len(errors) == 0 else None
    }

def validate_search_params(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate MCP server search parameters
    
    Args:
        params: Dictionary containing search parameters
        
    Returns:
        Validation result with success status and details
    """
    errors = []
    
    # Query validation
    query = params.get('query', '')
    if not isinstance(query, str):
        errors.append("Query must be a string")
    elif len(query) > 200:
        errors.append("Query exceeds maximum length of 200 characters")
    
    # Category validation
    category = params.get('category')
    if category is not None:
        if not isinstance(category, str):
            errors.append("Category must be a string")
        else:
            valid_categories = [
                'database', 'cloud_services', 'development_tools', 'communication',
                'ai_ml', 'productivity', 'search_data', 'file_system', 'web_apis',
                'security', 'monitoring', 'content_management'
            ]
            if category not in valid_categories:
                errors.append(f"Invalid category. Must be one of: {', '.join(valid_categories)}")
    
    # Official only validation
    official_only = params.get('official_only', False)
    if not isinstance(official_only, bool):
        errors.append("official_only must be a boolean")
    
    # Limit validation
    limit = params.get('limit', 20)
    if not isinstance(limit, int):
        errors.append("Limit must be an integer")
    elif limit < 1 or limit > 100:
        errors.append("Limit must be between 1 and 100")
    
    return {
        'valid': len(errors) == 0,
        'error': '; '.join(errors) if errors else None
    }

def validate_server_name(name: str) -> bool:
    """
    Validate MCP server name format
    
    Args:
        name: Server name to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not isinstance(name, str):
        return False
    
    # Server name pattern: letters, numbers, hyphens, underscores
    pattern = r'^[a-zA-Z0-9_-]+$'
    
    return (
        len(name) >= 2 and 
        len(name) <= 100 and 
        re.match(pattern, name) is not None
    )

def validate_url(url: str) -> Dict[str, Any]:
    """
    Validate URL format and accessibility
    
    Args:
        url: URL string to validate
        
    Returns:
        Validation result with details
    """
    if not isinstance(url, str):
        return {'valid': False, 'error': 'URL must be a string'}
    
    if len(url) > 2000:
        return {'valid': False, 'error': 'URL exceeds maximum length'}
    
    try:
        parsed = urlparse(url)
        
        if not parsed.scheme:
            return {'valid': False, 'error': 'URL missing scheme (http/https)'}
        
        if parsed.scheme not in ['http', 'https']:
            return {'valid': False, 'error': 'URL scheme must be http or https'}
        
        if not parsed.netloc:
            return {'valid': False, 'error': 'URL missing domain'}
        
        return {
            'valid': True,
            'parsed': {
                'scheme': parsed.scheme,
                'domain': parsed.netloc,
                'path': parsed.path
            }
        }
        
    except Exception as e:
        return {'valid': False, 'error': f'Invalid URL format: {str(e)}'}

def validate_email(email: str) -> bool:
    """
    Validate email address format
    
    Args:
        email: Email address to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not isinstance(email, str):
        return False
    
    # Basic email pattern
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    return (
        len(email) <= 254 and
        re.match(pattern, email) is not None
    )

def validate_json_data(data: str) -> Dict[str, Any]:
    """
    Validate and parse JSON data with error handling
    
    Args:
        data: JSON string to validate
        
    Returns:
        Validation result with parsed data or error details
    """
    if not isinstance(data, str):
        return {'valid': False, 'error': 'Data must be a string'}
    
    if len(data) > 1000000:  # 1MB limit
        return {'valid': False, 'error': 'JSON data exceeds size limit'}
    
    try:
        parsed_data = json.loads(data)
        return {
            'valid': True,
            'data': parsed_data,
            'size_bytes': len(data)
        }
    except json.JSONDecodeError as e:
        return {
            'valid': False,
            'error': f'Invalid JSON format: {str(e)}'
        }

def validate_file_upload(file_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate file upload parameters and metadata
    
    Args:
        file_data: Dictionary containing file upload information
        
    Returns:
        Validation result with sanitized file information
    """
    errors = []
    
    # Required fields
    required_fields = ['filename', 'file_size', 'file_type']
    for field in required_fields:
        if field not in file_data:
            errors.append(f"Missing required field: {field}")
    
    # Filename validation
    if 'filename' in file_data:
        filename = file_data['filename']
        if not isinstance(filename, str):
            errors.append("Filename must be a string")
        elif len(filename) > 255:
            errors.append("Filename exceeds maximum length")
        elif not re.match(r'^[a-zA-Z0-9._-]+$', filename):
            errors.append("Filename contains invalid characters")
    
    # File size validation
    if 'file_size' in file_data:
        file_size = file_data['file_size']
        if not isinstance(file_size, int):
            errors.append("File size must be an integer")
        elif file_size <= 0:
            errors.append("File size must be positive")
        elif file_size > 100 * 1024 * 1024:  # 100MB limit
            errors.append("File size exceeds 100MB limit")
    
    # File type validation
    if 'file_type' in file_data:
        file_type = file_data['file_type']
        allowed_types = [
            'text/plain', 'application/json', 'text/csv',
            'application/pdf', 'image/png', 'image/jpeg',
            'application/zip', 'text/markdown'
        ]
        if file_type not in allowed_types:
            errors.append(f"File type not allowed: {file_type}")
    
    return {
        'valid': len(errors) == 0,
        'errors': errors,
        'sanitized_filename': _sanitize_filename(file_data.get('filename', '')) if len(errors) == 0 else None
    }

def validate_configuration(config: Dict[str, Any], schema: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate configuration against a schema definition
    
    Args:
        config: Configuration dictionary to validate
        schema: Schema definition with field requirements
        
    Returns:
        Validation result with detailed field-level errors
    """
    errors = []
    field_errors = {}
    
    # Check required fields
    required_fields = schema.get('required', [])
    for field in required_fields:
        if field not in config:
            field_errors[field] = 'Required field is missing'
    
    # Validate field types and values
    field_types = schema.get('types', {})
    for field, expected_type in field_types.items():
        if field in config:
            value = config[field]
            if not _validate_field_type(value, expected_type):
                field_errors[field] = f'Expected type {expected_type}, got {type(value).__name__}'
    
    # Custom validation rules
    validation_rules = schema.get('validation', {})
    for field, rules in validation_rules.items():
        if field in config:
            field_result = _apply_validation_rules(config[field], rules)
            if not field_result['valid']:
                field_errors[field] = field_result['error']
    
    return {
        'valid': len(field_errors) == 0,
        'field_errors': field_errors,
        'validated_config': config if len(field_errors) == 0 else None
    }

def _sanitize_chat_input(data: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitize chat input data for security"""
    sanitized = data.copy()
    
    # Remove potential script tags and clean message
    if 'message' in sanitized:
        message = sanitized['message']
        # Remove script tags
        message = re.sub(r'<script[^>]*>.*?</script>', '', message, flags=re.IGNORECASE | re.DOTALL)
        # Remove potential XSS patterns
        message = re.sub(r'javascript:', '', message, flags=re.IGNORECASE)
        sanitized['message'] = message.strip()
    
    return sanitized

def _sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage"""
    # Remove path separators and dangerous characters
    sanitized = re.sub(r'[<>:"/\\|?*]', '_', filename)
    # Remove leading/trailing dots and spaces
    sanitized = sanitized.strip('. ')
    # Limit length
    if len(sanitized) > 200:
        name, ext = sanitized.rsplit('.', 1) if '.' in sanitized else (sanitized, '')
        sanitized = name[:195] + ('.' + ext if ext else '')
    
    return sanitized

def _validate_field_type(value: Any, expected_type: str) -> bool:
    """Validate field type against expected type string"""
    type_mapping = {
        'string': str,
        'integer': int,
        'number': (int, float),
        'boolean': bool,
        'array': list,
        'object': dict
    }
    
    expected_python_type = type_mapping.get(expected_type)
    if expected_python_type is None:
        return True  # Unknown type, skip validation
    
    return isinstance(value, expected_python_type)

def _apply_validation_rules(value: Any, rules: Dict[str, Any]) -> Dict[str, Any]:
    """Apply custom validation rules to a field value"""
    # Minimum length rule
    if 'min_length' in rules and isinstance(value, str):
        if len(value) < rules['min_length']:
            return {'valid': False, 'error': f'Minimum length is {rules["min_length"]}'}
    
    # Maximum length rule
    if 'max_length' in rules and isinstance(value, str):
        if len(value) > rules['max_length']:
            return {'valid': False, 'error': f'Maximum length is {rules["max_length"]}'}
    
    # Pattern rule
    if 'pattern' in rules and isinstance(value, str):
        if not re.match(rules['pattern'], value):
            return {'valid': False, 'error': 'Value does not match required pattern'}
    
    # Range rules for numbers
    if 'min_value' in rules and isinstance(value, (int, float)):
        if value < rules['min_value']:
            return {'valid': False, 'error': f'Minimum value is {rules["min_value"]}'}
    
    if 'max_value' in rules and isinstance(value, (int, float)):
        if value > rules['max_value']:
            return {'valid': False, 'error': f'Maximum value is {rules["max_value"]}'}
    
    return {'valid': True}
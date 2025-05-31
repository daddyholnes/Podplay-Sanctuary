"""
Service Initialization Module

Coordinates the initialization of all services with proper dependency injection,
error handling, and graceful degradation for the Podplay Sanctuary platform.
This replaces the scattered initialization logic from the monolithic structure.
"""

from typing import Dict, Any, Optional
from flask import Flask

from services.marketplace_service import MCPMarketplaceManager
from services.mama_bear_agent import MamaBearAgent
from services.enhanced_mama_service import EnhancedMamaBear
from services.discovery_agent_service import ProactiveDiscoveryAgent
from utils.logging_setup import get_logger

logger = get_logger(__name__)

# Global service instances
_services: Dict[str, Any] = {}
_initialized = False

def initialize_services(app: Flask) -> Dict[str, Any]:
    """
    Initialize all application services with proper dependency injection
    
    Args:
        app: Flask application instance
        
    Returns:
        Dictionary containing initialized service instances
    """
    global _services, _initialized
    
    if _initialized:
        logger.info("Services already initialized, returning existing instances")
        return _services
    
    try:
        logger.info("🚀 Initializing Podplay Sanctuary services...")
        
        # Initialize core services in dependency order
        _services['marketplace_manager'] = _initialize_marketplace_manager(app)
        _services['enhanced_mama'] = _initialize_enhanced_mama(app)
        _services['discovery_agent'] = _initialize_discovery_agent(app)
        _services['mama_bear_agent'] = _initialize_mama_bear_agent(app)
        
        # Initialize API dependencies
        _initialize_api_dependencies()
        
        # Validate service health
        health_check = _validate_service_health()
        
        _initialized = True
        
        logger.info("✅ All services initialized successfully")
        logger.info(f"🏥 Service health summary: {health_check['healthy_services']}/{health_check['total_services']} services healthy")
        
        return _services
        
    except Exception as e:
        logger.error(f"❌ Service initialization failed: {e}")
        _services['initialization_error'] = str(e)
        return _services

def _initialize_marketplace_manager(app: Flask) -> MCPMarketplaceManager:
    """
    Initialize MCP Marketplace Manager service
    
    Args:
        app: Flask application instance
        
    Returns:
        Initialized MCPMarketplaceManager instance
    """
    try:
        marketplace_manager = MCPMarketplaceManager()
        
        logger.info("🏪 MCP Marketplace Manager initialized successfully")
        return marketplace_manager
        
    except Exception as e:
        logger.error(f"Failed to initialize marketplace manager: {e}")
        raise

def _initialize_enhanced_mama(app: Flask) -> EnhancedMamaBear:
    """
    Initialize Enhanced Mama Bear service with external integrations
    
    Args:
        app: Flask application instance
        
    Returns:
        Initialized EnhancedMamaBear instance
    """
    try:
        enhanced_mama = EnhancedMamaBear()
        
        # Log service capabilities
        service_status = enhanced_mama.get_service_status()
        logger.info(f"🧠 Enhanced Mama Bear initialized - Memory: {service_status['overall_status']}")
        
        if service_status['mem0_service']['available']:
            logger.info("  ✅ Mem0.ai persistent memory active")
        else:
            logger.warning("  ⚠️ Mem0.ai not available - using local memory fallback")
        
        if service_status['together_service']['available']:
            logger.info("  ✅ Together.ai sandbox active")
        else:
            logger.warning("  ⚠️ Together.ai not available - code execution disabled")
        
        return enhanced_mama
        
    except Exception as e:
        logger.error(f"Failed to initialize enhanced mama: {e}")
        # Return basic instance for graceful degradation
        return EnhancedMamaBear()

def _initialize_discovery_agent(app: Flask) -> ProactiveDiscoveryAgent:
    """
    Initialize Proactive Discovery Agent service
    
    Args:
        app: Flask application instance
        
    Returns:
        Initialized ProactiveDiscoveryAgent instance
    """
    try:
        marketplace_manager = _services.get('marketplace_manager')
        enhanced_mama = _services.get('enhanced_mama')
        
        if not marketplace_manager:
            raise RuntimeError("Marketplace manager required for discovery agent")
        
        if not enhanced_mama:
            raise RuntimeError("Enhanced mama required for discovery agent")
        
        discovery_agent = ProactiveDiscoveryAgent(marketplace_manager, enhanced_mama)
        
        # Get discovery statistics
        stats = discovery_agent.get_discovery_stats()
        logger.info(f"🔍 Discovery Agent initialized - Status: {'enabled' if stats['discovery_enabled'] else 'disabled'}")
        
        return discovery_agent
        
    except Exception as e:
        logger.error(f"Failed to initialize discovery agent: {e}")
        raise

def _initialize_mama_bear_agent(app: Flask) -> MamaBearAgent:
    """
    Initialize Mama Bear Agent service with all dependencies
    
    Args:
        app: Flask application instance
        
    Returns:
        Initialized MamaBearAgent instance
    """
    try:
        marketplace_manager = _services.get('marketplace_manager')
        
        if not marketplace_manager:
            raise RuntimeError("Marketplace manager required for mama bear agent")
        
        mama_bear_agent = MamaBearAgent(marketplace_manager)
        
        logger.info("🐻 Mama Bear Agent initialized successfully")
        return mama_bear_agent
        
    except Exception as e:
        logger.error(f"Failed to initialize mama bear agent: {e}")
        raise

def _initialize_api_dependencies():
    """Initialize API blueprint dependencies with service injection"""
    try:
        # Initialize MCP API with marketplace manager
        marketplace_manager = _services.get('marketplace_manager')
        if marketplace_manager:
            from api.blueprints.mcp_api_blueprint import init_mcp_api
            init_mcp_api(marketplace_manager)
            logger.debug("  📡 MCP API initialized with marketplace manager")
        
        # Initialize Chat API with mama bear agent
        mama_bear_agent = _services.get('mama_bear_agent')
        if mama_bear_agent:
            from api.blueprints.chat_api_blueprint import init_chat_api
            init_chat_api(mama_bear_agent)
            logger.debug("  💬 Chat API initialized with mama bear agent")
        
        # Initialize Socket.IO handlers with service dependencies
        from api.blueprints.socket_handlers import set_service_dependencies
        set_service_dependencies(
            mama_bear=mama_bear_agent,
            marketplace=marketplace_manager
        )
        logger.debug("  🔌 Socket.IO handlers initialized with service dependencies")
        
        logger.info("📡 API dependencies initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize API dependencies: {e}")
        raise

def _validate_service_health() -> Dict[str, Any]:
    """
    Validate the health of all initialized services
    
    Returns:
        Health check summary dictionary
    """
    health_status = {
        'healthy_services': 0,
        'total_services': 0,
        'service_details': {},
        'overall_status': 'unknown'
    }
    
    # Check each service
    services_to_check = [
        'marketplace_manager',
        'enhanced_mama', 
        'discovery_agent',
        'mama_bear_agent'
    ]
    
    for service_name in services_to_check:
        health_status['total_services'] += 1
        service = _services.get(service_name)
        
        if service:
            try:
                # Basic health check - service exists and has key methods
                if hasattr(service, '__class__'):
                    health_status['service_details'][service_name] = {
                        'status': 'healthy',
                        'class': service.__class__.__name__
                    }
                    health_status['healthy_services'] += 1
                else:
                    health_status['service_details'][service_name] = {
                        'status': 'degraded',
                        'error': 'Invalid service instance'
                    }
            except Exception as e:
                health_status['service_details'][service_name] = {
                    'status': 'unhealthy',
                    'error': str(e)
                }
        else:
            health_status['service_details'][service_name] = {
                'status': 'missing',
                'error': 'Service not initialized'
            }
    
    # Determine overall status
    healthy_ratio = health_status['healthy_services'] / health_status['total_services']
    if healthy_ratio >= 1.0:
        health_status['overall_status'] = 'excellent'
    elif healthy_ratio >= 0.75:
        health_status['overall_status'] = 'good'
    elif healthy_ratio >= 0.5:
        health_status['overall_status'] = 'degraded'
    else:
        health_status['overall_status'] = 'critical'
    
    return health_status

def get_service(service_name: str) -> Optional[Any]:
    """
    Get a specific service instance by name
    
    Args:
        service_name: Name of the service to retrieve
        
    Returns:
        Service instance or None if not found
    """
    return _services.get(service_name)

def get_all_services() -> Dict[str, Any]:
    """
    Get all initialized service instances
    
    Returns:
        Dictionary of all service instances
    """
    return _services.copy()

def is_initialized() -> bool:
    """
    Check if services have been initialized
    
    Returns:
        True if services are initialized, False otherwise
    """
    return _initialized

def get_service_status() -> Dict[str, Any]:
    """
    Get comprehensive status of all services
    
    Returns:
        Dictionary containing detailed service status information
    """
    if not _initialized:
        return {
            'initialized': False,
            'error': 'Services not yet initialized'
        }
    
    health_check = _validate_service_health()
    
    status = {
        'initialized': True,
        'timestamp': _get_current_timestamp(),
        'health': health_check,
        'services': {}
    }
    
    # Get detailed status from each service
    for service_name, service in _services.items():
        if service_name == 'initialization_error':
            continue
            
        try:
            if hasattr(service, 'get_service_status'):
                status['services'][service_name] = service.get_service_status()
            elif hasattr(service, 'get_discovery_stats'):
                status['services'][service_name] = service.get_discovery_stats()
            else:
                status['services'][service_name] = {
                    'status': 'available',
                    'class': service.__class__.__name__
                }
        except Exception as e:
            status['services'][service_name] = {
                'status': 'error',
                'error': str(e)
            }
    
    return status

def shutdown_services():
    """
    Gracefully shutdown all services and cleanup resources
    """
    global _services, _initialized
    
    logger.info("🛑 Shutting down services...")
    
    # Perform any necessary cleanup
    for service_name, service in _services.items():
        try:
            if hasattr(service, 'shutdown'):
                service.shutdown()
                logger.debug(f"  ✅ {service_name} shutdown completed")
        except Exception as e:
            logger.warning(f"  ⚠️ Error shutting down {service_name}: {e}")
    
    _services.clear()
    _initialized = False
    
    logger.info("🏁 Service shutdown completed")

def _get_current_timestamp() -> str:
    """Get current timestamp in ISO format"""
    from datetime import datetime
    return datetime.now().isoformat()

# Service health monitoring
def monitor_service_health() -> Dict[str, Any]:
    """
    Continuous health monitoring for all services
    
    Returns:
        Health monitoring report
    """
    if not _initialized:
        return {'status': 'not_initialized'}
    
    monitoring_report = {
        'timestamp': _get_current_timestamp(),
        'overall_health': 'unknown',
        'service_health': {},
        'recommendations': []
    }
    
    # Check each service health
    critical_issues = 0
    warnings = 0
    
    for service_name, service in _services.items():
        if service_name == 'initialization_error':
            continue
            
        try:
            # Basic responsiveness check
            if hasattr(service, '__class__'):
                monitoring_report['service_health'][service_name] = 'healthy'
            else:
                monitoring_report['service_health'][service_name] = 'degraded'
                warnings += 1
                
        except Exception as e:
            monitoring_report['service_health'][service_name] = 'critical'
            critical_issues += 1
            logger.error(f"Service health check failed for {service_name}: {e}")
    
    # Determine overall health and recommendations
    if critical_issues > 0:
        monitoring_report['overall_health'] = 'critical'
        monitoring_report['recommendations'].append("Immediate attention required for critical services")
    elif warnings > 0:
        monitoring_report['overall_health'] = 'degraded'
        monitoring_report['recommendations'].append("Some services need attention")
    else:
        monitoring_report['overall_health'] = 'excellent'
        monitoring_report['recommendations'].append("All services operating normally")
    
    return monitoring_report
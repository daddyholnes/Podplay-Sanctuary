"""
Database models and initialization for Podplay Sanctuary

Provides clean database connection management and schema initialization
with proper error handling and connection pooling.
"""

import sqlite3
import threading
import os
from contextlib import contextmanager
from typing import Optional

from utils.logging_setup import get_logger

logger = get_logger(__name__)

# Thread-local storage for database connections
_local = threading.local()

class DatabaseManager:
    """
    Professional database management with connection pooling and error handling
    
    Provides centralized database operations with proper resource management
    and schema initialization for the Podplay Sanctuary application.
    """
    
    def __init__(self, database_url: str = "sanctuary.db"):
        """
        Initialize database manager with connection configuration
        
        Args:
            database_url: Database connection string or file path
        """
        self.database_url = database_url
        self._initialized = False
        self._lock = threading.Lock()
    
    def initialize_schema(self):
        """Initialize database schema with all required tables"""
        if self._initialized:
            return
        
        with self._lock:
            if self._initialized:
                return
            
            try:
                with self.get_connection() as conn:
                    self._create_tables(conn)
                    conn.commit()
                
                self._initialized = True
                logger.info("Database schema initialized successfully")
                
            except Exception as e:
                logger.error(f"Database initialization failed: {e}")
                raise
    
    def _create_tables(self, conn):
        """Create all application tables with proper schema"""
        
        # Agent Learning table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS agent_learning (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                interaction_type TEXT NOT NULL,
                context TEXT,
                insight TEXT,
                timestamp TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # MCP Servers table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS mcp_servers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT,
                repository_url TEXT,
                category TEXT,
                author TEXT,
                version TEXT,
                installation_method TEXT,
                capabilities TEXT,
                dependencies TEXT,
                configuration_schema TEXT,
                popularity_score INTEGER DEFAULT 0,
                last_updated TEXT,
                is_official BOOLEAN DEFAULT 0,
                is_installed BOOLEAN DEFAULT 0,
                installation_status TEXT DEFAULT 'not_installed',
                tags TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Project priorities table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS project_priorities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_name TEXT NOT NULL,
                priority_level INTEGER,
                description TEXT,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Agent learning table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS agent_learning (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                interaction_type TEXT,
                context TEXT,
                insight TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Uploaded files table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS uploaded_files (
                file_id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                original_name TEXT NOT NULL,
                file_path TEXT NOT NULL,
                file_type TEXT,
                file_size INTEGER,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Chat sessions table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS chat_sessions (
                session_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                session_data TEXT
            )
        ''')
        
        # Chat messages table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS chat_messages (
                message_id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                message_type TEXT NOT NULL,
                content TEXT NOT NULL,
                user_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES chat_sessions (session_id)
            )
        ''')
        
        logger.info("Database tables created successfully")
    
    @contextmanager
    def get_connection(self):
        """
        Get database connection with proper resource management
        
        Yields:
            SQLite connection with row factory configured
        """
        conn = None
        try:
            conn = sqlite3.connect(self.database_url, timeout=30.0)
            conn.row_factory = sqlite3.Row
            conn.execute("PRAGMA foreign_keys = ON")
            yield conn
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Database connection error: {e}")
            raise
        finally:
            if conn:
                conn.close()

# Global database manager instance
_db_manager: Optional[DatabaseManager] = None

def init_database(app):
    """
    Initialize database system with Flask application context
    
    Args:
        app: Flask application instance
    """
    global _db_manager
    
    database_url = app.config.get('DATABASE_URL', 'sanctuary.db')
    
    # Extract file path from SQLite URL if needed
    if database_url.startswith('sqlite:///'):
        database_url = database_url[10:]
    elif database_url.startswith('sqlite://'):
        database_url = database_url[9:]
    
    _db_manager = DatabaseManager(database_url)
    _db_manager.initialize_schema()
    
    logger.info(f"Database system initialized with URL: {database_url}")

@contextmanager
def get_db_connection():
    """
    Get database connection for use in services and models
    
    Yields:
        SQLite connection with row factory configured
    """
    if not _db_manager:
        raise RuntimeError("Database not initialized. Call init_database() first.")
    
    with _db_manager.get_connection() as conn:
        yield conn

def execute_query(query: str, params: tuple = (), fetch_one: bool = False, fetch_all: bool = True):
    """
    Execute database query with error handling
    
    Args:
        query: SQL query string
        params: Query parameters
        fetch_one: Return single row if True
        fetch_all: Return all rows if True
        
    Returns:
        Query results or None
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.execute(query, params)
            
            if fetch_one:
                return cursor.fetchone()
            elif fetch_all:
                return cursor.fetchall()
            else:
                conn.commit()
                return cursor.rowcount
                
    except Exception as e:
        logger.error(f"Query execution failed: {e}")
        raise

def get_database_stats() -> dict:
    """
    Get database statistics for monitoring and diagnostics
    
    Returns:
        Dictionary containing database statistics
    """
    try:
        stats = {}
        
        with get_db_connection() as conn:
            # Get table counts
            tables = ['mcp_servers', 'project_priorities', 
                     'agent_learning', 'uploaded_files', 'chat_sessions', 'chat_messages']
            
            for table in tables:
                cursor = conn.execute(f"SELECT COUNT(*) as count FROM {table}")
                stats[f"{table}_count"] = cursor.fetchone()['count']
            
            # Get database file size
            if hasattr(_db_manager, 'database_url') and os.path.exists(_db_manager.database_url):
                stats['database_size_bytes'] = os.path.getsize(_db_manager.database_url)
            
            stats['initialized'] = _db_manager._initialized if _db_manager else False
        
        return stats
        
    except Exception as e:
        logger.error(f"Failed to get database stats: {e}")
        return {"error": str(e)}
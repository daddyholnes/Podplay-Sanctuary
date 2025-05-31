"""
Database management for Podplay Sanctuary
"""
import sqlite3
import json
import logging
from pathlib import Path
from contextlib import contextmanager
from typing import Optional

logger = logging.getLogger(__name__)

class SanctuaryDB:
    """Database manager for the Podplay Build sanctuary"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._initialize_database()
    
    @contextmanager
    def get_connection(self):
        """Get database connection with context management"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        except Exception as e:
            conn.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            conn.close()
    
    def _initialize_database(self):
        """Initialize database with required tables"""
        with self.get_connection() as conn:
            # MCP servers table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS mcp_servers (
                    name TEXT PRIMARY KEY,
                    description TEXT,
                    repository_url TEXT,
                    category TEXT,
                    author TEXT,
                    version TEXT,
                    installation_method TEXT,
                    capabilities TEXT,
                    dependencies TEXT,
                    configuration_schema TEXT,
                    popularity_score INTEGER,
                    last_updated TEXT,
                    is_official BOOLEAN,
                    is_installed BOOLEAN,
                    installation_status TEXT,
                    tags TEXT
                )
            ''')
            
            # Daily briefings table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS daily_briefings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT UNIQUE,
                    briefing_data TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Project priorities table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS project_priorities (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT,
                    description TEXT,
                    priority_level INTEGER,
                    status TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Agent learning table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS agent_learning (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    agent_type TEXT,
                    learning_data TEXT,
                    context TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
            logger.info("🗄️ Database initialized successfully")
    
    def health_check(self) -> bool:
        """Check database health"""
        try:
            with self.get_connection() as conn:
                conn.execute("SELECT 1")
                return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False

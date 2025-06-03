import os
import json
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional

class SanctuaryDB:
    """Simple JSON-based database for Podplay Sanctuary"""
    
    def __init__(self, db_path: str = None):
        """Initialize the database with the given path or a default path"""
        if db_path is None:
            # Set default path to the data directory in the project root
            root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            self.db_dir = os.path.join(root_dir, 'data')
        else:
            self.db_dir = db_path
            
        # Create the directory if it doesn't exist
        os.makedirs(self.db_dir, exist_ok=True)
        
        # Initialize collections
        self.collections = {
            'chat_sessions': os.path.join(self.db_dir, 'chat_sessions.json'),
            'files': os.path.join(self.db_dir, 'files.json'),
            'models': os.path.join(self.db_dir, 'models.json'),
            'user_preferences': os.path.join(self.db_dir, 'user_preferences.json')
        }
        
        # Initialize each collection file if it doesn't exist
        for collection, file_path in self.collections.items():
            if not os.path.exists(file_path):
                with open(file_path, 'w') as f:
                    json.dump({}, f)
    
    def _load_collection(self, collection_name: str) -> Dict[str, Any]:
        """Load a collection from disk"""
        if collection_name not in self.collections:
            raise ValueError(f"Collection '{collection_name}' does not exist")
            
        try:
            with open(self.collections[collection_name], 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            # Return an empty dict if the file is empty or doesn't exist
            return {}
    
    def _save_collection(self, collection_name: str, data: Dict[str, Any]) -> None:
        """Save a collection to disk"""
        if collection_name not in self.collections:
            raise ValueError(f"Collection '{collection_name}' does not exist")
            
        with open(self.collections[collection_name], 'w') as f:
            json.dump(data, f, indent=2)
    
    def get_document(self, collection_name: str, doc_id: str) -> Optional[Dict[str, Any]]:
        """Get a document by ID from a collection"""
        collection = self._load_collection(collection_name)
        return collection.get(doc_id)
    
    def get_all_documents(self, collection_name: str) -> Dict[str, Any]:
        """Get all documents from a collection"""
        return self._load_collection(collection_name)
    
    def create_document(self, collection_name: str, document: Dict[str, Any], doc_id: str = None) -> str:
        """Create a new document in a collection"""
        collection = self._load_collection(collection_name)
        
        # Generate a UUID if no ID is provided
        if doc_id is None:
            doc_id = str(uuid.uuid4())
            
        # Add metadata
        document['id'] = doc_id
        document['created_at'] = datetime.now().isoformat()
        document['updated_at'] = document['created_at']
        
        # Save the document
        collection[doc_id] = document
        self._save_collection(collection_name, collection)
        
        return doc_id
    
    def update_document(self, collection_name: str, doc_id: str, updates: Dict[str, Any]) -> bool:
        """Update an existing document in a collection"""
        collection = self._load_collection(collection_name)
        
        if doc_id not in collection:
            return False
            
        # Update the document
        document = collection[doc_id]
        document.update(updates)
        document['updated_at'] = datetime.now().isoformat()
        
        # Save the collection
        self._save_collection(collection_name, collection)
        
        return True
    
    def delete_document(self, collection_name: str, doc_id: str) -> bool:
        """Delete a document from a collection"""
        collection = self._load_collection(collection_name)
        
        if doc_id not in collection:
            return False
            
        # Remove the document
        del collection[doc_id]
        self._save_collection(collection_name, collection)
        
        return True
    
    def query_documents(self, collection_name: str, query_func) -> Dict[str, Any]:
        """Query documents in a collection using a filter function"""
        collection = self._load_collection(collection_name)
        results = {}
        
        for doc_id, document in collection.items():
            if query_func(document):
                results[doc_id] = document
                
        return results

import os
import logging
from typing import Dict, List, Optional, Any

# Attempt to import Mem0Client and handle potential ImportError
try:
    from mem0 import MemoryClient
    MEM0_LIBRARY_AVAILABLE = True
except ImportError:
    MEM0_LIBRARY_AVAILABLE = False
    MemoryClient = None # Placeholder if library not found

logger = logging.getLogger(__name__)

# --- Mem0.ai Client Initialization ---
MEM0_API_KEY = os.getenv("MEM0_API_KEY")
MEM0_USER_ID = os.getenv("MEM0_USER_ID", "default_scout_user") # Default if not set

mem0_client: Optional[MemoryClient] = None
MEM0_ENABLED = False # Will be controlled by how client initialization goes

if MEM0_LIBRARY_AVAILABLE:
    if MEM0_API_KEY:
        try:
            # The MemoryClient initialization might vary based on library updates.
            # Assuming direct initialization or a specific method if documented.
            # For example, if MemoryClient() takes api_key directly:
            # mem0_client = MemoryClient(api_key=MEM0_API_KEY)
            # Or if it uses environment variables implicitly after setting them:
            # os.environ["MEM0_API_KEY"] = MEM0_API_KEY # This is often how SDKs work
            
            # Based on mem0ai==0.1.101, MemoryClient() does not take api_key as a direct arg.
            # It typically relies on the MEM0_API_KEY environment variable being set.
            # Ensure the .env variable is loaded by the main app.py correctly.
            mem0_client = MemoryClient()
            
            # You might want to add a simple test call here if the lib allows,
            # e.g., listing memories or checking status, to confirm connection.
            # For now, we assume initialization means it's ready if no exceptions.
            MEM0_ENABLED = True
            logger.info("Mem0.ai client initialized successfully for RAG service.")
        except Exception as e:
            logger.error(f"Failed to initialize Mem0.ai client: {e}. MEM0_API_KEY might be invalid or service unreachable.")
            mem0_client = None # Ensure client is None if init fails
    else:
        logger.warning("MEM0_API_KEY not found in environment variables. Mem0.ai RAG features will be disabled.")
else:
    logger.warning("Mem0 library not found. Mem0.ai RAG features will be disabled.")

def is_mem0_rag_available() -> bool:
    """Checks if the Mem0 client is initialized and ready."""
    return MEM0_ENABLED and mem0_client is not None

# --- Function to Add Data to Mem0.ai ---
def add_document_to_mem0(
    project_id: str,
    document_text: str,
    document_id: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Adds a document to Mem0.ai, associating it with a project_id.
    """
    if not is_mem0_rag_available():
        return {"success": False, "error": "Mem0.ai service not available."}

    try:
        # Prepare metadata and category
        combined_metadata = metadata or {}
        combined_metadata["project_id"] = project_id
        if document_id:
            combined_metadata["document_id"] = document_id
        
        category = f"rag_project_{project_id}"
        
        # Using user_id from environment for all project-related memories
        # The project_id is used as a category and in metadata for filtering.
        response = mem0_client.add(
            messages=[{"role": "user", "content": document_text}], # Mem0 expects a list of messages
            user_id=MEM0_USER_ID,
            metadata=combined_metadata,
            categories=[category],
            memory_id=document_id # Optional: if you want to use document_id as mem0's memory_id
        )
        logger.info(f"Document added to Mem0.ai for project {project_id}, doc_id: {document_id or 'auto'}. Response: {response}")
        return {"success": True, "response": response}
    except Exception as e:
        logger.error(f"Error adding document to Mem0.ai for project {project_id}: {e}", exc_info=True)
        return {"success": False, "error": str(e)}

# --- Function to Query Mem0.ai for Project Data ---
def query_mem0_for_project(
    project_id: str,
    query_text: str,
    limit: int = 5
) -> Dict[str, Any]:
    """
    Queries Mem0.ai for data relevant to a query, scoped to a project_id.
    """
    if not is_mem0_rag_available():
        return {"success": False, "error": "Mem0.ai service not available.", "results": []}

    try:
        category = f"rag_project_{project_id}"
        
        # Search using user_id and category for filtering
        # The `search` method might take filters differently. Adjust as per mem0 library.
        # Assuming categories can be used for filtering.
        # If direct metadata filtering is supported and preferred:
        # search_results = mem0_client.search(query=query_text, user_id=MEM0_USER_ID, limit=limit, metadata_filter={"project_id": project_id})
        
        # Using category based filtering if directly supported or as a convention
        search_results = mem0_client.search(
            query=query_text,
            user_id=MEM0_USER_ID,
            categories=[category], # Filter by category
            limit=limit
        )
        
        logger.info(f"Query to Mem0.ai for project {project_id} returned {len(search_results)} results.")
        return {"success": True, "results": search_results}
    except Exception as e:
        logger.error(f"Error querying Mem0.ai for project {project_id}: {e}", exc_info=True)
        return {"success": False, "error": str(e), "results": []}

# Example Test (can be run directly if needed, ensure .env is loaded)
if __name__ == '__main__':
    # This basic test requires MEM0_API_KEY and MEM0_USER_ID to be set in .env
    # and for the .env file to be in the parent directory or loaded appropriately.
    # For direct script execution, you might need to load dotenv here.
    from dotenv import load_dotenv
    # Assuming .env is in the parent directory of backend/
    dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    load_dotenv(dotenv_path=dotenv_path)
    
    # Re-initialize after loading .env if running script directly for testing
    MEM0_API_KEY_TEST = os.getenv("MEM0_API_KEY")
    MEM0_USER_ID_TEST = os.getenv("MEM0_USER_ID", "test_scout_user_direct")
    mem0_client_test: Optional[MemoryClient] = None
    
    if MEM0_LIBRARY_AVAILABLE and MEM0_API_KEY_TEST:
        try:
            # os.environ["MEM0_API_KEY"] = MEM0_API_KEY_TEST # Ensure env var is set for the client
            mem0_client_test = MemoryClient() # Re-init for test scope
            logger.info("Test Mem0.ai client initialized.")

            # Test adding a document
            test_project_id = "test_project_rag123"
            test_doc_text = "This is a test document about Python programming and data structures."
            add_response = add_document_to_mem0(
                test_project_id, 
                test_doc_text, 
                document_id="doc_py_001",
                metadata={"source": "test_script"}
            )
            print(f"Add document response: {add_response}")

            if add_response.get("success"):
                # Test querying
                query_response = query_mem0_for_project(
                    test_project_id,
                    "What are data structures in Python?",
                    limit=3
                )
                print(f"Query response: {query_response}")
        except Exception as e_test:
            logger.error(f"Error in test execution: {e_test}")
        finally:
            # Clean up any test data if possible/needed, or use distinct user_id for tests
            pass
    else:
        print("Skipping direct test: Mem0 library not found or MEM0_API_KEY not set in .env for testing.")

    # Reset globals if they were changed for test
    if 'mem0_client' in globals() and mem0_client is None and mem0_client_test is not None:
         # This is tricky; direct script execution testing might interfere with app's client.
         # Best to test services via app endpoints or separate test scripts.
         pass

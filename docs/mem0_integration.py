import os
import json
from mem0 import MemoryClient

# Initialize the client with your API key
os.environ["MEM0_API_KEY"] = "m0-tBwWs1ygkxcbEiVvX6iXdwiJ42epw8a3wyoEUlpg"
client = MemoryClient()

# Constants
USER_ID = "podplay_user"
AGENT_ID = "podplay_assistant"

def save_conversation():
    # Define conversation messages
    messages = [
        {
            "role": "system",
            "content": """# Podplay Studio - Chat UI Development
            
            ## Project Overview
            - Building a Google AI Studio-style chat interface for Podplay Studio
            - Modern, dark, modular UI with chat list, model selection, and file uploads
            - Backend integration with Azure OpenAI and Eden AI"""
        },
        {
            "role": "system",
            "content": """## Current Implementation Status
            
            ### Frontend
            - Created `agentic.html` with React-based chat interface
            - Implemented dark theme with responsive design
            - Added model selection dropdown with Azure OpenAI models
            - Basic message sending/receiving functionality"""
        },
        {
            "role": "system",
            "content": """### Backend
            - Set up Flask routes in `agentic_routes.py`
            - Integrated with Azure OpenAI API
            - Basic error handling and model management
            
            ### Key Files
            1. `frontend/agentic.html` - Main chat interface
            2. `frontend/src/agentic.js` - Client-side logic
            3. `backend/agentic_routes.py` - API endpoints
            4. `backend/app.py` - Main Flask application"""
        },
        {
            "role": "system",
            "content": """## Configuration
            
            ### Environment Variables
            - AZURE_OPENAI_API_KEY_SECONDARY
            - AZURE_OPENAI_ENDPOINT
            - AZURE_OPENAI_API_VERSION
            - EDEN_AI_API_KEY"""
        },
        {
            "role": "system",
            "content": """## Next Steps
            1. Complete Eden AI integration
            2. Add file upload functionality
            3. Implement chat history and persistence
            4. Add audio recording/playback
            5. Add video sending capability"""
        }
    ]
    
    try:
        # Save to mem0
        response = client.add(
            messages=messages,
            user_id="podplay_user",
            agent_id="podplay_assistant",
            metadata={
                "project": "Podplay Studio",
                "status": "in_progress",
                "type": "development_log"
            },
            categories=["development", "chat_ui"]
        )
        
        print("Successfully saved conversation to mem0.ai")
        print(f"Memory ID: {response.get('id')}")
        
        # Save memory ID for future reference
        with open('mem0_memory_id.txt', 'w') as f:
            f.write(response.get('id', ''))
            
        return response
        
    except Exception as e:
        print(f"Error saving to mem0.ai: {str(e)}")
        # Fallback: Save to a local file
        try:
            with open('conversation_backup.json', 'w') as f:
                import json
                json.dump({
                    "messages": messages,
                    "metadata": {
                        "project": "Podplay Studio",
                        "status": "in_progress"
                    }
                }, f, indent=2)
            print("Saved conversation backup to conversation_backup.json")
        except Exception as backup_error:
            print(f"Error saving backup file: {str(backup_error)}")
        return None

def search_memories(query):
    try:
        # Search memories
        results = client.search(
            query=query,
            user_id="podplay_user",
            threshold=0.5  # Adjust threshold as needed (0-1)
        )
        return results
    except Exception as e:
        print(f"Error searching memories: {str(e)}")
        return None

def list_all_memories():
    """List all memories for our user"""
    try:
        memories = client.get_all(user_id=USER_ID, page=1, page_size=10)
        print("\n=== All Memories ===")
        if isinstance(memories, dict) and 'data' in memories:
            for mem in memories['data']:
                print(f"\nMemory ID: {mem.get('id')}")
                print(f"Created: {mem.get('created_at')}")
                print(f"Content: {mem.get('content', '')[:200]}...")
        else:
            print("No memories found or unexpected response format.")
            print("Raw response:", json.dumps(memories, indent=2))
        return memories
    except Exception as e:
        print(f"Error listing memories: {str(e)}")
        return None

def get_memory_details(memory_id):
    """Get full details of a specific memory"""
    try:
        memory = client.get(memory_id=memory_id)
        print("\n=== Memory Details ===")
        print(json.dumps(memory, indent=2))
        return memory
    except Exception as e:
        print(f"Error getting memory details: {str(e)}")
        return None

if __name__ == "__main__":
    print("1. Saving conversation...")
    save_response = save_conversation()
    
    print("\n2. Listing all memories...")
    memories = list_all_memories()
    
    if memories and isinstance(memories, dict) and 'data' in memories and memories['data']:
        first_memory_id = memories['data'][0].get('id')
        if first_memory_id:
            print("\n3. Getting details of the first memory...")
            get_memory_details(first_memory_id)
    
    print("\n4. Searching for relevant memories...")
    search_query = "What are the next steps for Podplay Studio?"
    search_results = search_memories(search_query)
    if search_results:
        print(f"\nSearch results for '{search_query}':")
        print(json.dumps(search_results, indent=2))

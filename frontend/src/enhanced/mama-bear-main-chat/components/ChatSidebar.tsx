import React, { useState } from 'react';
import { ChatSession } from '../../../services/chatApi';

// Define props interface
interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | undefined;
  onSelectSession: (sessionId: string) => Promise<void>;
  onCreateSession: (name: string, description?: string) => Promise<ChatSession>;
}

/**
 * ChatSidebar component - displays a list of chat sessions and allows creating new ones
 */
const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  
  // Filter sessions based on search term
  const filteredSessions = sessions.filter(session => 
    session.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  // Handle creating a new session
  const handleCreateSession = async () => {
    try {
      setIsCreatingSession(true);
      const name = `New Research ${new Date().toLocaleString()}`;
      await onCreateSession(name, 'Conversation with Mama Bear');
    } catch (err) {
      console.error('Failed to create session:', err);
    } finally {
      setIsCreatingSession(false);
    }
  };

  return (
    <div className="mama-bear-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Mama Bear Research</h2>
        <div className="sidebar-search">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search conversations"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>
      
      <div className="chat-list">
        {filteredSessions.length === 0 ? (
          <div className="empty-state">
            <p>No conversations found.</p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              className={`chat-item ${session.id === activeSessionId ? 'active' : ''}`}
              onClick={() => onSelectSession(session.id)}
            >
              <div className="chat-item-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="chat-item-content">
                <h3 className="chat-item-title">{session.name}</h3>
                <p className="chat-item-subtitle">
                  {session.messages.length > 0
                    ? session.messages[session.messages.length - 1].content.substring(0, 30) + 
                      (session.messages[session.messages.length - 1].content.length > 30 ? '...' : '')
                    : 'No messages yet'}
                </p>
              </div>
              <div className="chat-item-time">
                {formatDate(session.updated)}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="sidebar-actions">
        <button
          className="new-chat-button"
          onClick={handleCreateSession}
          disabled={isCreatingSession}
          aria-label="Start new research conversation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {isCreatingSession ? 'Creating...' : 'New Research'}
        </button>
      </div>
    </div>
  );
};

export default ChatSidebar;
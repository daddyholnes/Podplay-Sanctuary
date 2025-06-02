import React from 'react';
import { ChatMessage } from '../../../services/chatApi';

// Define props interface
interface MessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

/**
 * MessageList component - displays chat messages and typing indicators
 */
const MessageList: React.FC<MessageListProps> = ({ messages, isTyping }) => {
  // Format message timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get avatar initial for a role
  const getAvatarInitial = (role: string) => {
    switch (role) {
      case 'user':
        return 'N';
      case 'assistant':
        return 'M';
      case 'system':
        return 'S';
      default:
        return '?';
    }
  };

  // Parse markdown-like formatting in messages
  const formatMessageContent = (content: string) => {
    // Replace *text* with <strong>text</strong>
    const boldText = content.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
    
    // Replace _text_ with <em>text</em>
    const italicText = boldText.replace(/\_([^_]+)\_/g, '<em>$1</em>');
    
    // Replace `code` with <code>code</code>
    const codeText = italicText.replace(/\`([^`]+)\`/g, '<code>$1</code>');
    
    // Replace URLs with links
    const linkedText = codeText.replace(
      /(https?:\/\/[^\s]+)/g, 
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    // Replace new lines with <br />
    return linkedText.replace(/\n/g, '<br />');
  };

  return (
    <div className="message-list" role="log" aria-live="polite">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message ${message.role}`}
          aria-label={`${message.role} message: ${message.content}`}
        >
          <div 
            className={`message-avatar ${message.role}`}
            aria-hidden="true"
          >
            {getAvatarInitial(message.role)}
          </div>
          <div className="message-content">
            <p 
              className="message-text"
              dangerouslySetInnerHTML={{ 
                __html: formatMessageContent(message.content) 
              }}
            />
            <div className="message-time" aria-label={`Sent at ${formatTime(message.timestamp)}`}>
              {formatTime(message.timestamp)}
            </div>
          </div>
        </div>
      ))}
      
      {isTyping && (
        <div className="typing-indicator" aria-label="Mama Bear is typing">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
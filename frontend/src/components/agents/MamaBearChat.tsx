import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Paperclip } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

const MamaBearChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with a welcome message
    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m Mama Bear. How can I help you with your project today?',
      timestamp: new Date().toISOString()
    }]);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate response (would call API in production)
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I\'m working on integrating with the backend. For now, I\'m just echoing what you send to demonstrate the chat UI flow.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Chat messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`mb-4 ${msg.role === 'user' ? 'ml-auto' : ''}`}
          >
            <div 
              className={`p-3 rounded-lg max-w-[80%] inline-block ${
                msg.role === 'user' 
                  ? 'bg-purple-600 text-white ml-auto' 
                  : 'bg-gray-800 text-white'
              }`}
            >
              {msg.content}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center text-sm text-gray-400">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="ml-2">Mama Bear is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      <div className="border-t border-gray-700 p-3">
        <div className="flex items-center bg-gray-800 rounded-lg p-2">
          <button className="text-gray-400 p-1 hover:text-purple-400 transition-colors">
            <Paperclip size={18} />
          </button>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-transparent border-none resize-none focus:ring-0 focus:outline-none text-white px-2 py-1"
            placeholder="Message Mama Bear..."
            rows={1}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className={`p-1 rounded ${
              !inputText.trim() || isLoading 
                ? 'text-gray-500' 
                : 'text-purple-400 hover:text-purple-300'
            } transition-colors`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MamaBearChat;

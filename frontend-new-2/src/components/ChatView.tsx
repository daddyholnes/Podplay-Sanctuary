
import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import ChatInput from './ChatInput';
import { MAMA_BEAR_AVATAR, USER_AVATAR } from '../constants';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatMessageItem: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.sender === 'user';
  const alignment = isUser ? 'justify-end' : 'justify-start';
  const messageClass = isUser ? 'chat-message-user ml-8' : 'chat-message-agent mr-8';
  const avatar = isUser ? USER_AVATAR : MAMA_BEAR_AVATAR;
  const name = isUser ? 'Nathan' : 'Mama Bear';

  return (
    <div className={`flex items-end space-x-3 p-2 ${alignment} animate-fade-in`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-lg shadow-lg">
          {avatar}
        </div>
      )}
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${messageClass} shadow-lg`}>
        <p className="text-sm font-semibold mb-2 opacity-80">{name}</p>
        <p className="whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
        <p className="text-xs opacity-60 mt-2 text-right">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-lg shadow-lg">
          {avatar}
        </div>
      )}
    </div>
  );
};

const ChatView: React.FC<ChatViewProps> = ({ messages, onSendMessage, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-900/50 backdrop-blur-sm rounded-xl">
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <ChatMessageItem key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start p-2 animate-fade-in">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-lg shadow-lg">
              {MAMA_BEAR_AVATAR}
            </div>
            <div className="ml-3 chat-message-agent">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse mr-1"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-75 mr-1"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150"></div>
                <span className="ml-3 text-sm italic opacity-80">Mama Bear is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-slate-700/30 bg-slate-800/30 backdrop-blur-sm rounded-b-xl">
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatView;

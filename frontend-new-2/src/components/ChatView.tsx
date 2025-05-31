
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
  const bgColor = isUser ? 'bg-purple-600' : 'bg-slate-700';
  const textColor = 'text-gray-100';
  const avatar = isUser ? USER_AVATAR : MAMA_BEAR_AVATAR;
  const name = isUser ? 'Nathan' : 'Mama Bear';

  return (
    <div className={`flex items-end space-x-3 p-2 ${alignment}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-lg">
          {avatar}
        </div>
      )}
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-xl shadow ${bgColor} ${textColor}`}>
        <p className="text-sm font-medium mb-1">{name}</p>
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <p className="text-xs text-gray-400 mt-1 text-right">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-lg">
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
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50">
        {messages.map((msg) => (
          <ChatMessageItem key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start p-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-lg">
              {MAMA_BEAR_AVATAR}
            </div>
            <div className="ml-3 px-4 py-3 rounded-xl shadow bg-slate-700 text-gray-100">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse mr-1"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-75 mr-1"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150"></div>
                <span className="ml-2 text-sm italic">Mama Bear is typing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-slate-700/50 p-0">
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatView;

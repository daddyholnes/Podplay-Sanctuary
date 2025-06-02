
import React, { useState } from 'react';
import { PaperAirplaneIcon, PlusCircleIcon, DocumentIcon, MicrophoneIcon, FaceSmileIcon } from '../constants';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const iconButtonClasses = "p-2 text-gray-400 hover:text-purple-400 transition-all duration-200 rounded-lg hover:bg-slate-700/30";

  return (
    <form onSubmit={handleSubmit} className="flex items-center p-4 space-x-3 w-full">
      <div className="flex items-center space-x-2">
        <button type="button" className={iconButtonClasses} title="Attach file">
          <PlusCircleIcon className="w-5 h-5" />
        </button>
        <button type="button" className={iconButtonClasses} title="Upload document">
          <DocumentIcon className="w-5 h-5" />
        </button>
        <button type="button" className={iconButtonClasses} title="Voice input">
          <MicrophoneIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask Mama Bear anything..."
          className="w-full p-3 pr-12 bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 rounded-xl text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-slate-700/70 outline-none transition-all duration-200"
          disabled={isLoading}
        />
        <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors" title="Add emoji">
          <FaceSmileIcon className="w-5 h-5" />
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading || !inputValue.trim()}
        className="p-3 scout-gradient text-white rounded-xl hover:shadow-lg disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-slate-800 glow-purple disabled:shadow-none"
        title="Send message"
      >
        <PaperAirplaneIcon className="w-6 h-6" />
      </button>
    </form>
  );
};

export default ChatInput;

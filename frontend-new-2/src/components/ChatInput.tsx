
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

  const iconButtonClasses = "p-2 text-gray-400 hover:text-purple-400 transition-colors rounded-full hover:bg-slate-700/50";

  return (
    <form onSubmit={handleSubmit} className="flex items-center p-3 bg-slate-800 space-x-2 w-full">
      <button type="button" className={iconButtonClasses} title="Attach file">
        <PlusCircleIcon className="w-6 h-6" />
      </button>
      <button type="button" className={iconButtonClasses} title="Upload image (Not implemented)">
        <DocumentIcon className="w-6 h-6" />
      </button>
       <button type="button" className={iconButtonClasses} title="Use microphone (Not implemented)">
        <MicrophoneIcon className="w-6 h-6" />
      </button>

      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Ask Mama Bear anything..."
        className="flex-1 p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
        disabled={isLoading}
      />
       <button type="button" className={iconButtonClasses} title="Emoji (Not implemented)">
        <FaceSmileIcon className="w-6 h-6" />
      </button>
      <button
        type="submit"
        disabled={isLoading || !inputValue.trim()}
        className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800"
        title="Send message"
      >
        <PaperAirplaneIcon className="w-6 h-6" />
      </button>
    </form>
  );
};

export default ChatInput;

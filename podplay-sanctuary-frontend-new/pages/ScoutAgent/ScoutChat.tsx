
import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { apiService } from '../../services/api';
import { ChatMessage } from '../../types';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import { Textarea } from '../../components/Input';
import Spinner from '../../components/common/Spinner';

const SECTION_ID = 'scout-agent';

interface ScoutChatProps {
  onNewTask: (taskId: string) => void;
}

const ScoutChat: React.FC<ScoutChatProps> = ({ onNewTask }) => {
  const { chatHistory, addMessage, updateMessage, setScoutStatus, setCurrentScoutTask } = useAppStore(state => ({
    chatHistory: state.chatHistory.filter(msg => msg.section === SECTION_ID),
    addMessage: state.addMessage,
    updateMessage: state.updateMessage,
    setScoutStatus: state.setScoutStatus,
    setCurrentScoutTask: state.setCurrentScoutTask,
  }));

  const [userMessage, setUserMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (userMessage.trim() === '') return;
    setIsLoading(true);
    const tempId = `temp_scout_${Date.now()}`;

    addMessage({
      id: tempId,
      message: userMessage.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      section: SECTION_ID,
      isLoading: true,
    });
    const messageToSend = userMessage.trim();
    setUserMessage('');

    try {
      setScoutStatus('working');
      const response = await apiService.sendScoutAutonomousRequest(messageToSend, { initialContext: 'User request from Scout UI' });
      
      // Simulate Scout taking over, socket will update actual messages and task.
      // The API response gives a taskId, which is useful.
      // The initial response from Scout might come via socket.
      updateMessage(tempId, { 
        message: messageToSend, // Keep user message, or replace with confirmation
        isLoading: false 
      });
      
      // Add a placeholder Scout response
      const scoutResponse: ChatMessage = {
        id: `scout_resp_${Date.now()}`,
        message: `Roger that! Processing your request: "${messageToSend.substring(0,50)}...". Task ID: ${response.taskId}. I'll keep you updated.`,
        sender: 'scout',
        timestamp: new Date().toISOString(),
        section: SECTION_ID,
      };
      addMessage(scoutResponse);

      setCurrentScoutTask({ id: response.taskId, name: `Task for: ${messageToSend.substring(0,30)}...`, status: 'pending', progress: 0 });
      onNewTask(response.taskId); // Notify parent about the new task

    } catch (error) {
      console.error("Error sending scout request:", error);
      updateMessage(tempId, { message: `Error: ${error instanceof Error ? error.message : 'Failed to send.'}`, isLoading: false });
      setScoutStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-secondary-bg border border-border rounded-lg shadow-sm">
      <div className="p-3 border-b border-border">
        <h3 className="font-display text-md text-scout">Scout Chat</h3>
      </div>
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {chatHistory.length === 0 && (
          <p className="text-sm text-text-muted text-center py-4">Give Scout a task, e.g., "Build a React app with a login page."</p>
        )}
        {chatHistory.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-2.5 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-accent text-white' : 'bg-tertiary-bg text-text-primary'}`}>
              <p className="whitespace-pre-wrap">{msg.message}</p>
              <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</p>
              {msg.isLoading && <Spinner size="sm" className="mt-1" />}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-border">
        <div className="flex items-center space-x-2">
          <Textarea
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder="Describe the task for Scout..."
            rows={1}
            className="flex-grow resize-none"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
          />
          <Button onClick={handleSendMessage} disabled={isLoading} isLoading={isLoading} variant="primary" size="md">
            <Icon name="paperAirplane" className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScoutChat;

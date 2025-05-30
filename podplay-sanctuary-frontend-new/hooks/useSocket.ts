
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppStore } from '../store/useAppStore';
import { ChatMessage, Environment, ScoutStatus, Task, TimelineEvent } from '../types';
import { SOCKET_URL } from '../utils/constants';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { addMessage, updateMessage, updateEnvironment, setScoutStatus, setCurrentScoutTask, updateScoutTaskProgress } = useAppStore();

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'], // Prefer WebSocket
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    newSocket.on('mama-bear-response', (data: ChatMessage) => {
      console.log('mama-bear-response received:', data);
      if(data.isLoading) {
        // If it's a streaming start or update for an existing message
        const existingMsg = useAppStore.getState().chatHistory.find(m => m.id === data.id);
        if (existingMsg) {
          updateMessage(data.id, { message: existingMsg.message + data.message, isLoading: true });
        } else {
          addMessage({ ...data, isLoading: true });
        }
      } else {
        // Final message or non-streaming message
        updateMessage(data.id, data); // This will update or add if not exists with isLoading: false
      }
    });

    newSocket.on('scout-update', (data: { status?: ScoutStatus; task?: Task; progress?: { taskId: string; progress: number; currentStep?: string } }) => {
      console.log('scout-update received:', data);
      if (data.status) {
        setScoutStatus(data.status);
      }
      if (data.task) {
        setCurrentScoutTask(data.task);
      }
      if (data.progress && useAppStore.getState().currentScoutTask?.id === data.progress.taskId) {
        updateScoutTaskProgress(data.progress.progress, data.progress.currentStep);
      }
    });
    
    newSocket.on('scout-timeline-event', (data: { taskId: string, event: TimelineEvent }) => {
      console.log('scout-timeline-event received:', data);
      // This would typically update a specific timeline store or component listening for this task's events
      // For now, just logging. You'd add this event to a list of events for the task.
    });

    newSocket.on('environment-update', (data: Environment) => {
      console.log('environment-update received:', data);
      updateEnvironment(data.id, data);
    });

    return () => {
      console.log('Closing socket connection');
      newSocket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependencies: addMessage, updateMessage, etc. cause re-runs. Empty array for singleton socket.

  return socket;
};


import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import { TimelineEvent } from '../../types';
import Icon, { IconName } from '../../components/Icon';
import Spinner from '../../components/common/Spinner';
import { useSocket } from '../../hooks/useSocket'; // For real-time updates

interface ScoutTimelineProps {
  taskId: string | null;
}

const getStatusIcon = (status: TimelineEvent['status']): IconName => {
  switch (status) {
    case 'completed': return 'checkCircle';
    case 'in-progress': return 'cog'; // Or a spinning icon
    case 'pending': return 'clock';
    case 'error': return 'xCircle';
    default: return 'questionCircle';
  }
};

const getStatusColor = (status: TimelineEvent['status']): string => {
  switch (status) {
    case 'completed': return 'text-success';
    case 'in-progress': return 'text-blue-500';
    case 'pending': return 'text-text-muted';
    case 'error': return 'text-error';
    default: return 'text-text-secondary';
  }
};

const ScoutTimeline: React.FC<ScoutTimelineProps> = ({ taskId }) => {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const socket = useSocket();

  const fetchTimeline = useCallback(async (currentTaskId: string) => {
    if (!currentTaskId) {
      setTimeline([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiService.getScoutTimeline(currentTaskId);
      setTimeline(response.timeline.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
    } catch (error) {
      console.error("Error fetching timeline:", error);
      setTimeline([]); // Clear on error or show error message
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (taskId) {
      fetchTimeline(taskId);
    } else {
      setTimeline([]);
    }
  }, [taskId, fetchTimeline]);

  useEffect(() => {
    if (socket && taskId) {
      const eventName = `scout-timeline-event:${taskId}`; // Task-specific event
      const handleTimelineUpdate = (event: TimelineEvent) => {
        console.log(`Timeline update for task ${taskId}:`, event);
        setTimeline(prevTimeline => {
            // Avoid duplicates if an event is somehow sent multiple times
            if (prevTimeline.find(e => e.id === event.id)) return prevTimeline;
            const newTimeline = [...prevTimeline, event];
            return newTimeline.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        });
      };
      socket.on(eventName, handleTimelineUpdate);
      console.log(`Listening for timeline updates on ${eventName}`);
      
      return () => {
        socket.off(eventName, handleTimelineUpdate);
        console.log(`Stopped listening for timeline updates on ${eventName}`);
      };
    }
  }, [socket, taskId]);


  return (
    <div className="h-full flex flex-col bg-secondary-bg border border-border rounded-lg shadow-sm">
      <div className="p-3 border-b border-border">
        <h3 className="font-display text-md text-scout">Scout Action Timeline {taskId ? `(Task: ${taskId.substring(0,8)}...)` : ''}</h3>
      </div>
      <div className="flex-grow overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {isLoading && <Spinner text="Loading timeline..." />}
        {!isLoading && timeline.length === 0 && (
          <p className="text-sm text-text-muted text-center py-4">
            {taskId ? 'No timeline events yet for this task.' : 'Select or start a task to see its timeline.'}
          </p>
        )}
        {timeline.map((event) => (
          <div key={event.id} className="flex items-start space-x-2">
            <Icon name={getStatusIcon(event.status)} className={`w-5 h-5 mt-0.5 ${getStatusColor(event.status)}`} />
            <div className="flex-grow">
              <p className={`text-sm font-medium ${getStatusColor(event.status)}`}>{event.event}</p>
              <p className="text-xs text-text-secondary">{event.description}</p>
              <p className="text-xs text-text-muted">{new Date(event.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoutTimeline;

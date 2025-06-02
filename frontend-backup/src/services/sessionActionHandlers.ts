// Session action handlers for MamaBear Chat
import { ChatSession, ApiResponse } from '../types/chatTypes';
import { mamaBearChatService } from './mamaBearChatService';

type ToastDisplayFunction = (message: string, type: 'info' | 'success' | 'warning' | 'error', variant?: string) => void;
type StateUpdater<T> = React.Dispatch<React.SetStateAction<T>>;

interface SessionActionHandlers {
  handleRenameSession: (session: ChatSession) => Promise<void>;
  handleDeleteSession: (session: ChatSession) => Promise<void>;
  handleExportSession: (session: ChatSession) => Promise<void>;
}

export const createSessionActionHandlers = (
  displayToast: ToastDisplayFunction,
  setSessions: StateUpdater<ChatSession[]>,
  setActiveChat: StateUpdater<ChatSession | null>,
  setMessages: StateUpdater<any[]>,
  setIsLoading: StateUpdater<boolean>
): SessionActionHandlers => {
  // Rename session action handler
  const handleRenameSession = async (session: ChatSession): Promise<void> => {
    const newName = prompt(`Enter new name for "${session.name}":`, session.name);
    if (!newName || newName === session.name) return;
    
    setIsLoading(true);
    try {
      const response = await mamaBearChatService.renameSession(session.id, newName);
      if (response.status === 'success') {
        // Update local state
        setSessions(prev => prev.map(s => 
          s.id === session.id ? { ...s, name: newName } : s
        ));
        
        // If this is the active chat, update that too
        setActiveChat(prev => prev && prev.id === session.id ? { ...prev, name: newName } : prev);
        
        displayToast(`Session renamed to "${newName}"`, 'success', 'purple');
      } else {
        displayToast(`Failed to rename session: ${response.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      displayToast(`Error renaming session: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete session action handler
  const handleDeleteSession = async (session: ChatSession): Promise<void> => {
    const confirmed = confirm(`Are you sure you want to delete "${session.name}"? This cannot be undone.`);
    if (!confirmed) return;
    
    setIsLoading(true);
    try {
      const response = await mamaBearChatService.deleteSession(session.id);
      if (response.status === 'success') {
        // Remove from sessions list
        setSessions(prev => prev.filter(s => s.id !== session.id));
        
        // If this was the active chat, clear it
        setActiveChat(prev => prev && prev.id === session.id ? null : prev);
        setMessages(prev => prev.filter(m => m.session_id !== session.id));
        
        displayToast(`Session "${session.name}" deleted`, 'success', 'purple');
      } else {
        displayToast(`Failed to delete session: ${response.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      displayToast(`Error deleting session: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Export session action handler
  const handleExportSession = async (session: ChatSession): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await mamaBearChatService.exportSession(session.id);
      if (response.status === 'success' && response.data.data) {
        // Create a blob and download it
        const blob = new Blob([response.data.data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${session.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        displayToast(`Session "${session.name}" exported successfully`, 'success', 'purple');
      } else {
        displayToast(`Failed to export session: ${response.error || 'No data returned'}`, 'error');
      }
    } catch (error) {
      displayToast(`Error exporting session: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleRenameSession,
    handleDeleteSession,
    handleExportSession
  };
};

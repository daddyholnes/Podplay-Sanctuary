import React, { useState, useEffect, useCallback, useRef } from 'react';
import { API_ENDPOINTS, buildApiUrl, buildDynamicApiUrl } from '../../config/api';
import { MultimodalInput } from '../MultimodalInput';
import { MediaAttachment } from '../../ModelRegistry';
import WorkspaceListComponent from './WorkspaceListComponent';
import WorkspaceCreationModal from './WorkspaceCreationModal';
import WebTerminalComponent from './WebTerminalComponent'; // Will be used by WorkspaceItem
import './WorkspacesView.css';

export interface NixOSWorkspace {
  id: string; // This will be the VM name from libvirt
  name: string;
  status: 'running' | 'stopped' | 'error' | 'creating' | 'unknown';
  vm_type: 'workspace' | 'ephemeral' | 'unknown';
  disk_path?: string;
  memory_mb?: number;
  vcpus?: number;
  ip_address?: string;
  terminal_websocket_url?: string; // Full URL for WebSocket connection
  // Add other fields from backend's get_domain_details as needed
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'mama-bear';
  timestamp: Date;
  type: 'text' | 'code' | 'mcp-action' | 'system';
  attachments?: MediaAttachment[];
  metadata?: {
    mcpServer?: string;
    codeLanguage?: string;
    executionResult?: any;
    memories?: any[];
  };
}

const WorkspacesView: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<NixOSWorkspace[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  
  const [selectedWorkspaceForTerminal, setSelectedWorkspaceForTerminal] = useState<NixOSWorkspace | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchWorkspaces = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.NIXOS_WORKSPACES.LIST));
      if (!response.ok) {
        throw new Error(`Failed to fetch workspaces: ${response.statusText}`);
      }
      const data = await response.json();
      if (Array.isArray(data.workspaces)) {
        // Transform backend data to frontend NixOSWorkspace interface
        const transformedWorkspaces = data.workspaces.map((ws: any) => ({
          id: ws.id, // Use ws.id instead of ws.name
          name: ws.name,
          status: ws.status,
          vm_type: ws.vm_type || 'workspace',
          disk_path: ws.disk_path,
          memory_mb: ws.memory_mb,
          vcpus: ws.vcpus,
          ip_address: ws.ip_address,
          // Add other relevant fields from ws object if needed
        }));
        setWorkspaces(transformedWorkspaces);
      } else {
        throw new Error(data.error || 'Invalid data format for workspaces');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error('Error fetching workspaces:', errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-scroll chat to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  // Send welcome message when component mounts
  useEffect(() => {
    const sendWelcomeMessage = () => {
      const welcomeMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        content: `🧸 **Hello! I'm Mama Bear, your NixOS Workspace Assistant!**

I'm here to help you manage your NixOS workspaces and answer any questions about:

• 🔧 **Workspace Management** - Creating, starting, stopping workspaces
• 💻 **Terminal Access** - Connecting to running workspaces  
• ❄️ **NixOS Configuration** - Package management and system configuration
• 🐚 **Shell Commands** - Running commands in your workspaces
• 📁 **File Management** - Working with files across workspaces
• 🛠️ **Development Tools** - Setting up development environments

You can upload images, files, or record audio/video messages. I have full multimodal capabilities to help with any workspace-related tasks!

What would you like to do with your NixOS workspaces today?`,
        sender: 'mama-bear',
        timestamp: new Date(),
        type: 'text'
      };
      setChatMessages([welcomeMessage]);
    };

    if (chatMessages.length === 0) {
      sendWelcomeMessage();
    }
  }, [chatMessages.length]);

  // Send message to Mama Bear
  const sendMessage = useCallback(async () => {
    if (!currentInput.trim() && attachments.length === 0) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: currentInput,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setAttachments([]);
    setIsTyping(true);

    try {
      const formData = new FormData();
      formData.append('message', currentInput);
      formData.append('context', JSON.stringify({
        workspace_count: workspaces.length,
        running_workspaces: workspaces.filter(w => w.status === 'running').length,
        current_workspaces: workspaces.map(w => ({ id: w.id, name: w.name, status: w.status }))
      }));

      // Add attachments to FormData
      attachments.forEach((attachment, index) => {
        if (attachment.file) {
          formData.append(`attachment_${index}`, attachment.file);
        }
        formData.append(`attachment_${index}_type`, attachment.type);
        formData.append(`attachment_${index}_name`, attachment.name);
      });

      const response = await fetch(buildApiUrl(API_ENDPOINTS.MAMA_BEAR.CHAT), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      const mamaBearMessage: ChatMessage = {
        id: `msg-${Date.now()}-mb`,
        content: data.response || 'Sorry, I encountered an issue processing your request.',
        sender: 'mama-bear',
        timestamp: new Date(),
        type: 'text',
        metadata: data.metadata
      };

      setChatMessages(prev => [...prev, mamaBearMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        content: '🐻 Sorry, I encountered an error processing your message. Please try again.',
        sender: 'mama-bear',
        timestamp: new Date(),
        type: 'system'
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [currentInput, attachments, workspaces]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleCreateWorkspace = async (name: string, memoryMB: number, vcpus: number) => {
    setIsLoading(true); // Or a specific creating state
    setError(null);
    console.log(`Attempting to create workspace: ${name}, Mem: ${memoryMB}, vCPUs: ${vcpus}`);
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.NIXOS_WORKSPACES.CREATE), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, memory_mb: memoryMB, vcpus }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Failed to create workspace: ${response.statusText}`);
      }
      console.log('Workspace created successfully:', data);
      fetchWorkspaces(); // Refresh list
      setIsCreateModalOpen(false);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error('Error creating workspace:', errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (workspaceId: string, action: 'start' | 'stop' | 'delete') => {
    let endpoint = '';
    let successMessage = '';

    switch (action) {
      case 'start':
        endpoint = buildDynamicApiUrl(API_ENDPOINTS.NIXOS_WORKSPACES.START, { id: workspaceId });
        successMessage = 'Workspace starting...';
        break;
      case 'stop':
        endpoint = buildDynamicApiUrl(API_ENDPOINTS.NIXOS_WORKSPACES.STOP, { id: workspaceId });
        successMessage = 'Workspace stopping...';
        break;
      case 'delete':
        if (!window.confirm(`Are you sure you want to delete workspace ${workspaceId}? This is irreversible.`)) {
          return;
        }
        endpoint = buildDynamicApiUrl(API_ENDPOINTS.NIXOS_WORKSPACES.DELETE, { id: workspaceId });
        successMessage = 'Workspace deleting...';
        break;
      default:
        return;
    }

    console.log(`Performing action '${action}' on workspace ${workspaceId} via ${endpoint}`);
    // Add a temporary optimistic update or loading state for the specific item
    // For now, just log and refetch
    try {
      const response = await fetch(endpoint, { method: action === 'delete' ? 'DELETE' : 'POST' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Action ${action} failed: ${response.statusText}`);
      }
      alert(data.message || successMessage); // Simple feedback for now
      fetchWorkspaces(); // Refresh list
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg); // Show error globally for now
      console.error(`Error performing ${action} on ${workspaceId}:`, errorMsg);
      fetchWorkspaces(); // Refresh list even on error to get latest state
    }
  };
  
  const handleOpenTerminal = async (workspaceId: string) => {
    console.log(`Request to open terminal for workspace: ${workspaceId}`);
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(buildDynamicApiUrl(API_ENDPOINTS.NIXOS_WORKSPACES.GET, { id: workspaceId }));
      if (!response.ok) throw new Error(`Failed to fetch workspace details: ${response.statusText}`);
      const data = await response.json();
      if (data.id) { // Check if workspace object exists
        if (data.status !== 'running') {
          alert("Workspace is not running. Please start it first.");
          setIsLoading(false);
          return;
        }
        if (!data.ip_address) {
          alert("IP address not available for this workspace. Cannot establish terminal connection.");
          setIsLoading(false);
          return;
        }
        // Create enhanced workspace object with terminal_websocket_url
        const enhancedWorkspace = {
          ...data,
          terminal_websocket_url: buildDynamicApiUrl(API_ENDPOINTS.NIXOS_WORKSPACES.TERMINAL_WEBSOCKET, { id: workspaceId })
        } as NixOSWorkspace;
        setSelectedWorkspaceForTerminal(enhancedWorkspace);
      } else {
        throw new Error(data.error || "Could not get workspace details for terminal.");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error(`Error opening terminal for ${workspaceId}:`, errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseTerminal = () => {
    setSelectedWorkspaceForTerminal(null);
  };


  return (
    <div className="workspaces-view">
      {/* Chat Panel */}
      <div className={`chat-panel ${isChatCollapsed ? 'collapsed' : ''}`}>
        <div className="chat-header">
          <div className="mama-bear-branding">
            <span className="mama-bear-icon">🧸</span>
            <h3>Mama Bear</h3>
            <span className="workspace-assistant">NixOS Workspace Assistant</span>
          </div>
          <button 
            className="chat-toggle"
            onClick={() => setIsChatCollapsed(!isChatCollapsed)}
            title={isChatCollapsed ? "Expand Chat" : "Collapse Chat"}
          >
            {isChatCollapsed ? '📖' : '📕'}
          </button>
        </div>

        {!isChatCollapsed && (
          <>
            <div className="chat-messages">
              {chatMessages.map((message) => (
                <div key={message.id} className={`message ${message.sender}`}>
                  <div className="message-content">
                    {message.sender === 'mama-bear' && (
                      <div className="message-avatar">🧸</div>
                    )}
                    <div className="message-bubble">
                      <div className="message-text">
                        {message.content.split('\n').map((line, index) => (
                          <div key={index}>
                            {line.includes('**') ? (
                              <span dangerouslySetInnerHTML={{
                                __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              }} />
                            ) : line}
                          </div>
                        ))}
                      </div>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="message-attachments">
                          {message.attachments.map((attachment) => (
                            <div key={attachment.id} className="attachment">
                              {attachment.type === 'image' && attachment.url && (
                                <img src={attachment.url} alt={attachment.name} />
                              )}
                              <span>{attachment.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="message-timestamp">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="message mama-bear">
                  <div className="message-content">
                    <div className="message-avatar">🧸</div>
                    <div className="message-bubble typing">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <MultimodalInput
                value={currentInput}
                onChange={setCurrentInput}
                onSend={sendMessage}
                onAttachmentsChange={setAttachments}
                attachments={attachments}
                placeholder="Ask Mama Bear about your NixOS workspaces..."
                disabled={isTyping}
                className="workspace-chat-input"
              />
            </div>
          </>
        )}
      </div>

      {/* Main Workspaces Content */}
      <div className="workspaces-main-content">
        <div className="workspaces-header">
          <h2>❄️ NixOS Workspaces</h2>
          <button onClick={() => setIsCreateModalOpen(true)} className="create-workspace-btn">
            + Create New Workspace
          </button>
        </div>

        {isLoading && <p>Loading workspaces...</p>}
        {error && <p className="error-message">Error: {error}</p>}

        {!isLoading && !error && workspaces.length === 0 && (
          <p>No workspaces found. Create one to get started!</p>
        )}

        {!isLoading && !error && workspaces.length > 0 && (
          <WorkspaceListComponent
            workspaces={workspaces}
            onAction={handleAction}
            onOpenTerminal={handleOpenTerminal}
          />
        )}

        {isCreateModalOpen && (
          <WorkspaceCreationModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={handleCreateWorkspace}
          />
        )}
        
        {selectedWorkspaceForTerminal && selectedWorkspaceForTerminal.terminal_websocket_url && (
          <WebTerminalComponent
            workspaceId={selectedWorkspaceForTerminal.id}
            websocketUrl={selectedWorkspaceForTerminal.terminal_websocket_url}
            isOpen={!!selectedWorkspaceForTerminal}
            onClose={handleCloseTerminal}
          />
        )}
      </div>
    </div>
  );
};

export default WorkspacesView;

import React, { useState } from 'react';
// import WebTerminalComponent from './WebTerminalComponent'; // Assuming this will be created
import './WorkspaceItem.css';

interface Workspace {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error' | 'unknown' | string; // Allow string for other statuses
  vm_type: string;
  disk_path?: string;
  memory_mb?: number;
  vcpus?: number;
  ip_address?: string;
  ssh_port?: number;
  terminal_websocket_url?: string;
}

interface WorkspaceItemProps {
  workspace: Workspace;
  onDelete: (workspaceId: string) => void;
  onStart: (workspaceId: string) => void;
  onStop: (workspaceId: string) => void;
}

const WorkspaceItem: React.FC<WorkspaceItemProps> = ({
  workspace,
  onDelete,
  onStart,
  onStop,
}) => {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false); // For start/stop/delete buttons

  const sftpUser = "executor"; // Placeholder, should come from config or backend if dynamic

  const handleStart = async () => {
    setIsLoadingAction(true);
    await onStart(workspace.id);
    setIsLoadingAction(false);
  };

  const handleStop = async () => {
    setIsLoadingAction(true);
    await onStop(workspace.id);
    setIsLoadingAction(false);
  };

  const handleDelete = async () => {
    setIsLoadingAction(true);
    await onDelete(workspace.id);
    // No need to setIsLoadingAction(false) if component is unmounted after delete.
  };
  
  const getStatusClassName = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'statusRunning';
      case 'stopped':
        return 'statusStopped';
      case 'error':
        return 'statusError';
      default:
        return 'statusUnknown';
    }
  };


  return (
    <div className={`workspaceItem ${getStatusClassName(workspace.status)}`}>
      <div className="workspaceItemHeader">
        <h3>{workspace.name} <span className="workspaceId">({workspace.id})</span></h3>
        <span className={`statusIndicator ${getStatusClassName(workspace.status)}`}>
          {workspace.status.toUpperCase()}
        </span>
      </div>
      <div className="workspaceItemActions">
        <button 
          onClick={() => setIsTerminalOpen(!isTerminalOpen)} 
          disabled={workspace.status !== 'running' || isLoadingAction}
          className="button"
        >
          {isTerminalOpen ? 'Close Terminal' : 'Open Terminal'}
        </button>
        <button 
          onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
          className="button"
          disabled={isLoadingAction}
        >
          {isDetailsExpanded ? 'Hide Details' : 'Show Details'}
        </button>
        {workspace.status === 'running' ? (
          <button onClick={handleStop} disabled={isLoadingAction} className="button buttonWarning">
            {isLoadingAction ? 'Stopping...' : 'Stop'}
          </button>
        ) : (
          <button onClick={handleStart} disabled={isLoadingAction} className="button buttonSuccess">
            {isLoadingAction ? 'Starting...' : 'Start'}
          </button>
        )}
        <button onClick={handleDelete} disabled={isLoadingAction} className="button buttonDanger">
          {isLoadingAction ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      {isDetailsExpanded && (
        <div className="workspaceItemDetails">
          <p><strong>ID:</strong> {workspace.id}</p>
          <p><strong>Type:</strong> {workspace.vm_type}</p>
          <p><strong>Status:</strong> {workspace.status}</p>
          {workspace.ip_address && <p><strong>IP Address:</strong> {workspace.ip_address}:{workspace.ssh_port || 22}</p>}
          {workspace.memory_mb && <p><strong>Memory:</strong> {workspace.memory_mb} MB</p>}
          {workspace.vcpus && <p><strong>vCPUs:</strong> {workspace.vcpus}</p>}
          {workspace.disk_path && <p><strong>Disk Path:</strong> {workspace.disk_path}</p>}
          {workspace.status === 'running' && workspace.ip_address && (
            <p className="sftpDetails">
              <strong>SFTP:</strong> <code>sftp://{sftpUser}@{workspace.ip_address}:{workspace.ssh_port || 22}</code>
              <br/>
              (Use SSH key: <code>~/.ssh/id_rsa_nixos_vm_executor</code> or as configured)
            </p>
          )}
           {workspace.terminal_websocket_url && isTerminalOpen && (
             <p><strong>Terminal WebSocket:</strong> {workspace.terminal_websocket_url}</p>
           )}
        </div>
      )}

      {isTerminalOpen && workspace.status === 'running' && workspace.terminal_websocket_url && (
        <div className="terminalContainer">
          {/* 
            Placeholder for WebTerminalComponent. 
            It will be created in a subsequent step.
          */}
          <p style={{color: 'white', background: 'black', padding: '10px'}}>
            WebTerminalComponent for workspace {workspace.id} would be here. <br/>
            WebSocket URL: {workspace.terminal_websocket_url}
          </p>
          {/* 
          <WebTerminalComponent 
            workspaceId={workspace.id}
            websocketUrl={workspace.terminal_websocket_url}
            isOpen={isTerminalOpen}
            onClose={() => setIsTerminalOpen(false)}
          /> 
          */}
        </div>
      )}
       {isTerminalOpen && workspace.status !== 'running' && (
        <p className="errorMessage">Terminal cannot be opened. Workspace is not running.</p>
      )}
    </div>
  );
};

export default WorkspaceItem;

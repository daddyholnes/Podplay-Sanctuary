import React from 'react';
import { NixOSWorkspace } from './WorkspacesView';
import './WorkspaceItem.css'; // We'll create this next

interface WorkspaceItemProps {
  workspace: NixOSWorkspace;
  onAction: (workspaceId: string, action: 'start' | 'stop' | 'delete') => void;
  onOpenTerminal: (workspaceId: string) => void;
  // Add onBrowseFiles, onShowDetails etc.
}

const WorkspaceItem: React.FC<WorkspaceItemProps> = ({
  workspace,
  onAction,
  onOpenTerminal,
}) => {
  const { id, name, status, vm_type, ip_address } = workspace;

  const handleTerminalOpen = () => {
    if (status === 'running') {
      onOpenTerminal(id);
    } else {
      alert(`Workspace '${name}' is not running. Please start it first.`);
    }
  };
  
  const handleBrowseFiles = () => {
    // For Option A (External Client):
    if (status === 'running' && ip_address) {
      // Assuming standard SSH user 'executor' and default SFTP port 22
      // The actual workspace root path inside the VM would be needed.
      // For now, just providing host. Path needs to be determined by user or agent.
      const sftpUrl = `sftp://${process.env.REACT_APP_NIXOS_VM_SSH_USER || 'executor'}@${ip_address}`;
      alert(`Use an SFTP client to connect to: ${sftpUrl}
(You might need to configure the root path, e.g., /home/executor or /workspace)`);
      // For Option B (Integrated), this would trigger a different action.
    } else {
      alert(`Workspace '${name}' is not running or IP is not available for file browsing.`);
    }
  };

  return (
    <div className={`workspace-item status-${status?.toLowerCase().replace(/ /g, '-')}`}>
      <div className="workspace-info">
        <h4 className="workspace-name">{name} (ID: {id})</h4>
        <p className="workspace-status">Status: <span className={`status-badge status-${status}`}>{status || 'unknown'}</span></p>
        {vm_type && <p className="workspace-type">Type: {vm_type}</p>}
        {status === 'running' && ip_address && <p className="workspace-ip">IP: {ip_address}</p>}
      </div>
      <div className="workspace-actions">
        <button onClick={handleTerminalOpen} disabled={status !== 'running'} className="action-btn terminal-btn">
          💻 Open Terminal
        </button>
        <button onClick={handleBrowseFiles} disabled={status !== 'running'} className="action-btn files-btn">
          📁 Browse Files (SFTP)
        </button>
        {status === 'running' ? (
          <button onClick={() => onAction(id, 'stop')} className="action-btn stop-btn">
            ⏹️ Stop
          </button>
        ) : (
          <button onClick={() => onAction(id, 'start')} className="action-btn start-btn">
            ▶️ Start
          </button>
        )}
        <button onClick={() => onAction(id, 'delete')} className="action-btn delete-btn">
          🗑️ Delete
        </button>
        {/* <button onClick={() => console.log("Details for", id)} className="action-btn">Details</button> */}
      </div>
    </div>
  );
};

export default WorkspaceItem;

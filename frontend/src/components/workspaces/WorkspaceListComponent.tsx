import React from 'react';
import WorkspaceItem from './WorkspaceItem';

// Assuming Workspace interface is defined in WorkspacesView.tsx or a shared types file
interface Workspace {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error' | 'unknown';
  vm_type: string;
  disk_path?: string;
  memory_mb?: number;
  vcpus?: number;
  ip_address?: string;
  ssh_port?: number;
  terminal_websocket_url?: string;
}

interface WorkspaceListProps {
  workspaces: Workspace[];
  onDelete: (workspaceId: string) => void;
  onStart: (workspaceId: string) => void;
  onStop: (workspaceId: string) => void;
}

const WorkspaceListComponent: React.FC<WorkspaceListProps> = ({
  workspaces,
  onDelete,
  onStart,
  onStop,
}) => {
  if (!workspaces || workspaces.length === 0) {
    return null; // Or a message like "No workspaces available." if not handled by parent
  }

  return (
    <div className="workspaceList">
      {workspaces.map((workspace) => (
        <WorkspaceItem
          key={workspace.id}
          workspace={workspace}
          onDelete={onDelete}
          onStart={onStart}
          onStop={onStop}
        />
      ))}
    </div>
  );
};

export default WorkspaceListComponent;

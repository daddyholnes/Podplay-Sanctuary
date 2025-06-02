import React from 'react';
import WorkspaceItem from './WorkspaceItem';
import { NixOSWorkspace } from './WorkspacesView'; // Assuming type is exported from WorkspacesView

interface WorkspaceListComponentProps {
  workspaces: NixOSWorkspace[];
  onAction: (workspaceId: string, action: 'start' | 'stop' | 'delete') => void;
  onOpenTerminal: (workspaceId: string) => void;
  // Add other actions like onBrowseFiles if needed
}

const WorkspaceListComponent: React.FC<WorkspaceListComponentProps> = ({
  workspaces,
  onAction,
  onOpenTerminal,
}) => {
  if (workspaces.length === 0) {
    return <p>No workspaces available. Create one to get started!</p>;
  }

  return (
    <div className="workspace-list">
      {workspaces.map((workspace) => (
        <WorkspaceItem
          key={workspace.id}
          workspace={workspace}
          onAction={onAction}
          onOpenTerminal={onOpenTerminal}
        />
      ))}
    </div>
  );
};

export default WorkspaceListComponent;

import React, { ReactNode } from 'react';

interface WorkspaceLayoutProps {
  children: ReactNode;
  layout: string;
}

/**
 * WorkspaceLayout manages the overall layout of the workspace panels
 * It adapts the grid layout based on the selected layout mode
 */
const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({ children, layout }) => {
  const getGridTemplateAreas = () => {
    switch (layout) {
      case 'standard':
        return `
          "explorer editor editor"
          "explorer editor editor"
          "explorer terminal terminal"
          "resources terminal terminal"
        `;
      case 'coding':
        return `
          "explorer editor editor"
          "explorer editor editor"
          "explorer editor editor"
          "resources terminal terminal"
        `;
      case 'preview':
        return `
          "explorer editor preview"
          "explorer editor preview"
          "explorer terminal preview"
          "resources terminal resources"
        `;
      default:
        return `
          "explorer editor editor"
          "explorer editor editor"
          "explorer terminal terminal"
          "resources terminal terminal"
        `;
    }
  };

  const getGridTemplateColumns = () => {
    switch (layout) {
      case 'standard':
        return '250px 1fr 1fr';
      case 'coding':
        return '250px 1fr 1fr';
      case 'preview':
        return '250px 1fr 1fr';
      default:
        return '250px 1fr 1fr';
    }
  };

  const getGridTemplateRows = () => {
    switch (layout) {
      case 'standard':
        return '1fr 1fr 1fr 200px';
      case 'coding':
        return '1fr 1fr 1fr 200px';
      case 'preview':
        return '1fr 1fr 1fr 200px';
      default:
        return '1fr 1fr 1fr 200px';
    }
  };

  return (
    <div 
      className="workspace-layout h-[calc(100vh-48px)] overflow-hidden"
      style={{
        display: 'grid',
        gridTemplateAreas: getGridTemplateAreas(),
        gridTemplateColumns: getGridTemplateColumns(),
        gridTemplateRows: getGridTemplateRows(),
        gap: '1px',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
      }}
    >
      {children}
    </div>
  );
};

export default WorkspaceLayout;

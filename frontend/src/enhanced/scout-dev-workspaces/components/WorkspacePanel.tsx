import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { X } from 'lucide-react';

interface WorkspacePanelProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  initialSize: number;
  minSize?: number;
  maxSize?: number;
  resizable?: 'top' | 'right' | 'bottom' | 'left' | 'none';
  panelId: string;
  layout: string;
  tabs?: Array<{ id: string, name: string, type: string }>;
}

/**
 * WorkspacePanel component creates a resizable panel with a header
 * that can be positioned in different areas of the workspace layout
 */
const WorkspacePanel: React.FC<WorkspacePanelProps> = ({
  title,
  icon,
  children,
  initialSize,
  minSize = 100,
  maxSize = 800,
  resizable = 'none',
  panelId,
  layout,
  tabs = []
}) => {
  const [size, setSize] = useState(initialSize);
  const [activeTab, setActiveTab] = useState<string | null>(tabs.length > 0 ? tabs[0].id : null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Get the grid area based on panel ID and layout
  const getGridArea = () => {
    return panelId;
  };

  // Handle panel resizing
  const handleResize = (event: React.SyntheticEvent, { size: { width, height } }) => {
    // Determine which dimension to set based on resizable direction
    if (resizable === 'left' || resizable === 'right') {
      setSize(width);
    } else if (resizable === 'top' || resizable === 'bottom') {
      setSize(height);
    }
  };

  // Style the panel based on its position in the layout
  const getPanelStyle = () => {
    const baseStyle = {
      gridArea: getGridArea(),
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column' as const,
      backgroundColor: 'var(--sanctuary-bg-panel)',
      borderRadius: '4px',
      boxShadow: 'var(--sanctuary-shadow-sm)'
    };

    return baseStyle;
  };

  // Generate resize handles based on the resizable direction
  const getResizeHandles = (): Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'> => {
    switch (resizable) {
      case 'top':
        return ['n'];
      case 'right':
        return ['e'];
      case 'bottom':
        return ['s'];
      case 'left':
        return ['w'];
      default:
        return [];
    }
  };

  // Determine if the panel is resizable and in which direction
  const isResizable = resizable !== 'none';

  // Apply appropriate resize constraints
  const getResizeConstraints = () => {
    if (resizable === 'left' || resizable === 'right') {
      return {
        width: size,
        height: Infinity,
        minConstraints: [minSize, Infinity],
        maxConstraints: [maxSize, Infinity]
      };
    } else {
      return {
        width: Infinity,
        height: size,
        minConstraints: [Infinity, minSize],
        maxConstraints: [Infinity, maxSize]
      };
    }
  };

  // Handle tab selection
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Effect to handle panel initialize
  useEffect(() => {
    // Any panel initialization logic
  }, []);

  // Create the panel content
  const renderPanel = () => (
    <div ref={panelRef} className="flex flex-col h-full w-full overflow-hidden">
      {/* Panel Header */}
      <div className="panel-header flex items-center h-10 bg-purple-100/50 dark:bg-purple-900/20 px-3 border-b border-purple-200 dark:border-purple-800">
        <div className="flex items-center mr-2 text-purple-700 dark:text-purple-300">
          {icon}
        </div>
        <div className="text-sm font-medium text-purple-800 dark:text-purple-200">
          {title}
        </div>
      </div>

      {/* Panel Tabs (if present) */}
      {tabs.length > 0 && (
        <div className="flex overflow-x-auto bg-white/50 dark:bg-gray-900/50 border-b border-purple-100 dark:border-purple-900">
          {tabs.map(tab => (
            <div 
              key={tab.id}
              className={`
                flex items-center h-8 px-3 text-xs cursor-pointer
                ${activeTab === tab.id 
                  ? 'bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-300 border-b-2 border-purple-500'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-gray-800'}
              `}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.name}
              {activeTab === tab.id && (
                <button className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Panel Content */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
        {children}
      </div>
    </div>
  );

  // If not resizable, return a simple div
  if (!isResizable) {
    return (
      <div style={getPanelStyle()}>
        {renderPanel()}
      </div>
    );
  }

  // If resizable, wrap in a Resizable component
  const resizeProps = getResizeConstraints();
  const handles = getResizeHandles();
  
  return (
    <div style={getPanelStyle()}>
      <Resizable
        width={resizeProps.width}
        height={resizeProps.height}
        handle={<div className="panel-resize-handle bg-purple-400/30 hover:bg-purple-500/50 absolute" />}
        minConstraints={resizeProps.minConstraints}
        maxConstraints={resizeProps.maxConstraints}
        onResize={handleResize}
        resizeHandles={handles}
        axis={resizable === 'left' || resizable === 'right' ? 'x' : 'y'}
      >
        {renderPanel()}
      </Resizable>
    </div>
  );
};

export default WorkspacePanel;

import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MessageCircle, Code, Package, Grid, Layers } from 'lucide-react';

const SideNavigation = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  const navItems = [
    {
      name: 'Mama Bear',
      path: '/mama-bear',
      icon: <MessageCircle size={24} />,
      description: 'Main chat interface with Mama Bear'
    },
    {
      name: 'Scout Chat',
      path: '/scout-chat',
      icon: <MessageCircle size={24} />,
      description: 'Multi-modal chat with Scout agent'
    },
    {
      name: 'Workspaces',
      path: '/workspaces',
      icon: <Code size={24} />,
      description: 'Dev workspaces for projects'
    },
    {
      name: 'MCP Marketplace',
      path: '/mcp-marketplace',
      icon: <Package size={24} />,
      description: 'Browse and install MCP packages'
    },
    {
      name: 'Mini Apps',
      path: '/mini-apps',
      icon: <Grid size={24} />,
      description: 'Chrome-style tabs for mini applications'
    }
  ];

  return (
    <aside className="h-full flex flex-col bg-white dark:bg-gray-900 transition-all duration-300">
      {/* Logo */}
      <div className="h-14 flex items-center justify-center border-b border-purple-100 dark:border-purple-900">
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="w-8 h-8 rounded-md bg-purple-gradient flex items-center justify-center">
            <Layers size={20} className="text-white" />
          </div>
          {isExpanded && (
            <span className="ml-3 font-medium text-purple-700 dark:text-purple-300 hidden md:block">
              Podplay
            </span>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center p-2 rounded-md transition-all duration-200 ease-in-out group ${
                isActive
                  ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800'
              }`}
              title={item.description}
            >
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              <span className="ml-3 hidden md:block">
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default SideNavigation;

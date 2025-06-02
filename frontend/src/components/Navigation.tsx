import type { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MessageCircle, 
  Bot, 
  Code, 
  Grid3X3, 
  Package, 
  Workflow,
  Sparkles 
} from 'lucide-react';

export const Navigation: FC = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      label: 'Mama Bear',
      icon: MessageCircle,
      description: 'Main Chat & Research'
    },
    {
      path: '/scout-chat',
      label: 'Scout Chat',
      icon: Bot,
      description: 'Multi-modal AI Assistant'
    },
    {
      path: '/workspaces',
      label: 'Workspaces',
      icon: Code,
      description: 'Dev Environments'
    },
    {
      path: '/miniapps',
      label: 'Mini Apps',
      icon: Grid3X3,
      description: 'App Hub'
    },
    {
      path: '/marketplace',
      label: 'MCP Market',
      icon: Package,
      description: 'Package Discovery'
    },
    {
      path: '/workflow',
      label: 'Workflow',
      icon: Workflow,
      description: 'Scout Stages'
    },
    {
      path: '/integration-workbench',
      label: 'Integration',
      icon: Sparkles,
      description: 'Integration Workbench'
    }
  ];

  return (
    <nav className="sidebar-navigation">
      <div className="sidebar-nav-container">
        {/* Logo */}
        <div className="sidebar-nav-logo">
          <Sparkles className="sidebar-logo-icon" />
          <span className="sidebar-logo-text">Podplay Studio</span>
        </div>

        {/* Navigation Items */}
        <div className="sidebar-nav-items">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                title={item.description}
              >
                <Icon className="sidebar-nav-icon" />
                <span className="sidebar-nav-label">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Section */}
        <div className="sidebar-nav-user">
          <div className="sidebar-user-avatar">
            <span>N</span>
          </div>
        </div>
      </div>
      <style>{`
        .sidebar-navigation {
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-primary);
          width: 220px;
          min-width: 180px;
          max-width: 260px;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          padding: 2rem 0 2rem 0;
          box-shadow: 2px 0 8px 0 rgba(139,92,246,0.04);
        }
        .sidebar-nav-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          align-items: stretch;
          justify-content: flex-start;
        }
        .sidebar-nav-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 700;
          font-size: 1.25rem;
          color: var(--text-primary);
          margin-bottom: 2rem;
          padding-left: 2rem;
        }
        .sidebar-logo-icon {
          width: 2rem;
          height: 2rem;
          color: var(--purple-primary);
        }
        .sidebar-logo-text {
          background: var(--gradient-purple);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }
        .sidebar-nav-items {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }
        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 2rem;
          border-radius: 0.75rem;
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 1rem;
          transition: all 0.2s;
          position: relative;
        }
        .sidebar-nav-item:hover {
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }
        .sidebar-nav-item.active {
          color: var(--purple-light);
          background: rgba(139, 92, 246, 0.12);
        }
        .sidebar-nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          border-radius: 2px;
          background: var(--gradient-purple);
        }
        .sidebar-nav-icon {
          width: 1.5rem;
          height: 1.5rem;
        }
        .sidebar-nav-label {
          font-size: 1rem;
        }
        .sidebar-nav-user {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-top: auto;
          padding: 2rem;
        }
        .sidebar-user-avatar {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background: var(--gradient-purple);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .sidebar-user-avatar:hover {
          transform: scale(1.05);
        }
        @media (max-width: 900px) {
          .sidebar-navigation {
            width: 60px;
            min-width: 60px;
            padding: 1rem 0;
          }
          .sidebar-nav-logo, .sidebar-logo-text, .sidebar-nav-label {
            display: none;
          }
          .sidebar-nav-item {
            padding: 0.85rem 1rem;
            justify-content: center;
          }
        }
      `}</style>
    </nav>
  );
};

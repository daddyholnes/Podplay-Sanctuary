// Cherry Studio Inspired Mini App Launcher
// Curated collection of AI, productivity, and development tools
// Seamlessly integrated into Sanctuary/Podplay environment

import React, { useState, useRef } from 'react';
import './MiniAppLauncher.css';
import LogoIcon from './LogoIcon';

// ==================== INTERFACES ====================

interface MiniApp {
  id: string;
  name: string;
  url: string;
  category: 'ai' | 'coding' | 'productivity' | 'utilities' | 'research';
  description: string;
  featured?: boolean;
  requiresAuth?: boolean;
  isInternal?: boolean; // For Sanctuary internal tools
}

interface MiniAppLauncherProps {
  mode?: 'launcher' | 'embedded' | 'modal';
  onAppSelect?: (app: MiniApp) => void;
  className?: string;
}

// ==================== CURATED MINI APPS REGISTRY ====================

const CURATED_MINI_APPS: MiniApp[] = [
  // ✨ AI & Research Tools
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    url: 'https://www.perplexity.ai',
    category: 'ai',
    description: 'AI-powered research and search',
    featured: true
  },
  {
    id: 'notebooklm',
    name: 'NotebookLM',
    url: 'https://notebooklm.google.com',
    category: 'ai',
    description: 'AI-powered notebook and research assistant',
    featured: true
  },
  {
    id: 'gemini',
    name: 'Gemini Deep Research',
    url: 'https://gemini.google.com/app',
    category: 'ai',
    description: 'Google Gemini advanced research capabilities',
    featured: true
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://chat.openai.com',
    category: 'ai',
    description: 'OpenAI ChatGPT interface'
  },
  {
    id: 'claude',
    name: 'Claude',
    url: 'https://claude.ai',
    category: 'ai',
    description: 'Anthropic Claude AI assistant'
  },

  // 💻 Coding & Development
  {
    id: 'vscode-web',
    name: 'VS Code Web',
    url: 'https://vscode.dev',
    category: 'coding',
    description: 'Visual Studio Code in your browser',
    featured: true
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot Chat',
    url: 'https://copilot.microsoft.com',
    category: 'coding',
    description: 'AI-powered code assistant',
    featured: true
  },
  {
    id: 'replit',
    name: 'Replit',
    url: 'https://replit.com',
    category: 'coding',
    description: 'Online IDE and development environment'
  },
  {
    id: 'codesandbox',
    name: 'CodeSandbox',
    url: 'https://codesandbox.io',
    category: 'coding',
    description: 'Online code editor for web development'
  },
  {
    id: 'stackblitz',
    name: 'StackBlitz',
    url: 'https://stackblitz.com',
    category: 'coding',
    description: 'Instant dev environments'
  },
  {
    id: 'codepen',
    name: 'CodePen',
    url: 'https://codepen.io',
    category: 'coding',
    description: 'Online code editor and sharing'
  },
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com',
    category: 'coding',
    description: 'Code repositories and collaboration'
  },

  // 📋 Productivity
  {
    id: 'notion',
    name: 'Notion',
    url: 'https://notion.so',
    category: 'productivity',
    description: 'All-in-one workspace for notes and projects'
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    url: 'https://obsidian.md',
    category: 'productivity',
    description: 'Knowledge management and note-taking'
  },
  {
    id: 'figma',
    name: 'Figma',
    url: 'https://figma.com',
    category: 'productivity',
    description: 'Design and prototyping tool'
  },
  {
    id: 'linear',
    name: 'Linear',
    url: 'https://linear.app',
    category: 'productivity',
    description: 'Issue tracking and project management'
  },
  {
    id: 'miro',
    name: 'Miro',
    url: 'https://miro.com',
    category: 'productivity',
    description: 'Online collaborative whiteboard'
  },
  {
    id: 'canva',
    name: 'Canva',
    url: 'https://canva.com',
    category: 'productivity',
    description: 'Graphic design platform'
  },

  // 🛠️ Utilities
  {
    id: 'excalidraw',
    name: 'Excalidraw',
    url: 'https://excalidraw.com',
    category: 'utilities',
    description: 'Virtual collaborative whiteboard'
  },
  {
    id: 'regex101',
    name: 'Regex101',
    url: 'https://regex101.com',
    category: 'utilities',
    description: 'Regular expression tester and debugger'
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    url: 'https://jsonformatter.curiousconcept.com',
    category: 'utilities',
    description: 'JSON formatter and validator'
  },
  {
    id: 'base64',
    name: 'Base64 Tools',
    url: 'https://www.base64encode.org',
    category: 'utilities',
    description: 'Base64 encoding and decoding'
  },
  {
    id: 'color-picker',
    name: 'Coolors',
    url: 'https://coolors.co',
    category: 'utilities',
    description: 'Color palette generator'
  }
];

// ==================== MINI APP LAUNCHER COMPONENT ====================

export const MiniAppLauncher: React.FC<MiniAppLauncherProps> = ({
  mode = 'launcher',
  onAppSelect,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeApp, setActiveApp] = useState<MiniApp | null>(null);
  const [isGridView, setIsGridView] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ==================== FILTERING & SEARCH ====================

  const categories = [
    { id: 'all', name: 'All Apps', icon: '📱' },
    { id: 'ai', name: 'AI & Research', icon: '🤖' },
    { id: 'coding', name: 'Development', icon: '💻' },
    { id: 'productivity', name: 'Productivity', icon: '📋' },
    { id: 'utilities', name: 'Utilities', icon: '🛠️' }
  ];

  const filteredApps = CURATED_MINI_APPS.filter(app => {
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredApps = filteredApps.filter(app => app.featured);

  // ==================== APP MANAGEMENT ====================

  const handleAppSelect = (app: MiniApp) => {
    setActiveApp(app);
    if (onAppSelect) {
      onAppSelect(app);
    }
  };

  const toggleFavorite = (appId: string) => {
    setFavorites(prev => 
      prev.includes(appId) 
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const handleAppLaunch = (app: MiniApp) => {
    if (app.isInternal) {
      // Handle internal routing
      window.location.hash = app.url;
    } else {
      // Launch external app in iframe or new tab
      handleAppSelect(app);
    }
  };

  // ==================== RENDER FUNCTIONS ====================

  const renderAppCard = (app: MiniApp) => (
    <div 
      key={app.id} 
      className={`mini-app-card ${activeApp?.id === app.id ? 'active' : ''}`}
      onClick={() => handleAppLaunch(app)}
    >
      <div className="app-icon">
        <LogoIcon appId={app.id} size="medium" />
        {app.isInternal && <span className="internal-badge">🏠</span>}
      </div>
      <div className="app-info">
        <h3>{app.name}</h3>
        <p>{app.description}</p>
        {app.requiresAuth && <span className="auth-badge">🔐 Auth Required</span>}
      </div>
      <div className="app-actions">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(app.id);
          }}
          className={`favorite-btn ${favorites.includes(app.id) ? 'favorited' : ''}`}
        >
          {favorites.includes(app.id) ? '⭐' : '☆'}
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (!app.isInternal) {
              window.open(app.url, '_blank');
            }
          }}
          className="external-btn"
          title="Open in new tab"
        >
          ↗️
        </button>
      </div>
    </div>
  );

  const renderEmbeddedApp = () => {
    if (!activeApp || activeApp.isInternal) return null;

    return (
      <div className="embedded-app-container">
        <div className="embedded-app-header">
          <div className="app-title">
            <LogoIcon appId={activeApp.id} size="small" />
            <span>{activeApp.name}</span>
          </div>
          <div className="app-controls">
            <button onClick={() => window.open(activeApp.url, '_blank')}>
              ↗️ Open in New Tab
            </button>
            <button onClick={() => setActiveApp(null)}>
              ✕ Close
            </button>
          </div>
        </div>
        <iframe
          ref={iframeRef}
          src={activeApp.url}
          className="mini-app-iframe"
          title={activeApp.name}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
        />
      </div>
    );
  };

  // ==================== MAIN RENDER ====================

  if (mode === 'embedded' && activeApp) {
    return renderEmbeddedApp();
  }

  return (
    <div className={`mini-app-launcher ${className}`}>
      {/* Header */}
      <div className="launcher-header">
        <div className="header-title">
          <h2>🚀 Mini App Launcher</h2>
          <p>Cherry Studio inspired curated tools for your workflow</p>
        </div>
        <div className="header-controls">
          <button 
            className={`view-toggle ${isGridView ? 'active' : ''}`}
            onClick={() => setIsGridView(true)}
          >
            ⊞ Grid
          </button>
          <button 
            className={`view-toggle ${!isGridView ? 'active' : ''}`}
            onClick={() => setIsGridView(false)}
          >
            ☰ List
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="launcher-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Search mini apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="category-tabs">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Apps */}
      {selectedCategory === 'all' && searchQuery === '' && featuredApps.length > 0 && (
        <div className="featured-section">
          <h3>⭐ Featured Apps</h3>
          <div className="featured-apps">
            {featuredApps.map(renderAppCard)}
          </div>
        </div>
      )}

      {/* All Apps */}
      <div className="apps-section">
        <div className="section-header">
          <h3>
            {selectedCategory === 'all' ? '📱 All Apps' : 
             categories.find(c => c.id === selectedCategory)?.icon + ' ' + 
             categories.find(c => c.id === selectedCategory)?.name}
          </h3>
          <span className="app-count">
            {filteredApps.length} app{filteredApps.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className={`apps-grid ${isGridView ? 'grid-view' : 'list-view'}`}>
          {filteredApps.map(renderAppCard)}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button 
          className="quick-action-btn research-btn"
          onClick={() => handleAppLaunch(CURATED_MINI_APPS.find(app => app.id === 'perplexity')!)}
        >
          🔍 Research with Perplexity
        </button>
        <button 
          className="quick-action-btn development-btn"
          onClick={() => handleAppLaunch(CURATED_MINI_APPS.find(app => app.id === 'vscode-web')!)}
        >
          💻 Open VS Code Web
        </button>
        <button 
          className="quick-action-btn ai-btn"
          onClick={() => handleAppLaunch(CURATED_MINI_APPS.find(app => app.id === 'chatgpt')!)}
        >
          🤖 Chat with GPT
        </button>
      </div>

      {/* Embedded App View */}
      {activeApp && !activeApp.isInternal && (
        <div className="embedded-overlay">
          {renderEmbeddedApp()}
        </div>
      )}
    </div>
  );
};

export default MiniAppLauncher;
export { CURATED_MINI_APPS };
export type { MiniApp };

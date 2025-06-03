import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Bot, 
  MessageSquare, 
  Code2, 
  Store, 
  Grid3X3,
  Sun,
  Moon,
  Palette,
  Heart
} from 'lucide-react';
import { useThemeStore } from '@/stores';

const Sidebar: React.FC = () => {
  const { theme, setTheme, sensoryMode, setSensoryMode } = useThemeStore();

  const navItems = [
    {
      path: '/chat',
      icon: MessageCircle,
      label: 'Mama Bear Chat',
      description: 'Your main sanctuary',
    },
    {
      path: '/scout',
      icon: Bot,
      label: 'Scout Agent',
      description: 'Autonomous dev workflow',
    },
    {
      path: '/multi-chat',
      icon: MessageSquare,
      label: 'Multi-Modal Chat',
      description: 'All AI models in one place',
    },
    {
      path: '/workspaces',
      icon: Code2,
      label: 'Dev Workspaces',
      description: 'Development environments',
    },
    {
      path: '/marketplace',
      icon: Store,
      label: 'MCP Marketplace',
      description: 'Discover and install tools',
    },
    {
      path: '/mini-apps',
      icon: Grid3X3,
      label: 'Mini Apps',
      description: 'Embedded applications',
    },
  ];

  const themeOptions = [
    { key: 'light', icon: Sun, label: 'Light' },
    { key: 'dark', icon: Moon, label: 'Dark' },
    { key: 'purple-neon', icon: Palette, label: 'Purple Neon' },
  ];

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`w-64 h-full flex flex-col ${
        theme === 'light'
          ? 'bg-white/80 border-r border-purple-200'
          : theme === 'dark'
          ? 'bg-slate-800/80 border-r border-slate-700'
          : 'bg-purple-900/50 border-r border-purple-600/30'
      } backdrop-blur-md`}
    >
      {/* Header */}
      <div className="p-6 border-b border-purple-200 dark:border-slate-700">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center space-x-3"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            theme === 'light'
              ? 'bg-gradient-to-br from-purple-500 to-pink-500'
              : theme === 'dark'
              ? 'bg-gradient-to-br from-purple-600 to-pink-600'
              : 'bg-gradient-to-br from-purple-400 to-pink-400'
          }`}>
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className={`text-lg font-semibold ${
              theme === 'light' ? 'text-purple-800' : 'text-purple-100'
            }`}>
              PodPlay Studio
            </h1>
            <p className={`text-sm ${
              theme === 'light' ? 'text-purple-600' : 'text-purple-300'
            }`}>
              Your Build Sanctuary
            </p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? theme === 'light'
                      ? 'bg-purple-100 text-purple-800 shadow-sm'
                      : theme === 'dark'
                      ? 'bg-purple-800/30 text-purple-100'
                      : 'bg-purple-600/30 text-purple-100'
                    : theme === 'light'
                    ? 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                    : 'text-gray-300 hover:bg-slate-700/50 hover:text-purple-200'
                }
                ${sensoryMode ? 'focus:ring-2 focus:ring-purple-500' : ''}
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.label}</p>
                <p className={`text-xs truncate ${
                  theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {item.description}
                </p>
              </div>
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Theme Switcher */}
      <div className="p-4 border-t border-purple-200 dark:border-slate-700">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {/* Sensory Mode Toggle */}
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              Sensory Mode
            </span>
            <button
              onClick={() => setSensoryMode(!sensoryMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                sensoryMode 
                  ? 'bg-purple-600' 
                  : theme === 'light' 
                  ? 'bg-gray-200' 
                  : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  sensoryMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Theme Buttons */}
          <div className="space-y-2">
            <p className={`text-xs font-medium ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Theme
            </p>
            <div className="flex space-x-2">
              {themeOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setTheme(option.key as 'light' | 'dark' | 'purple-neon')}
                  className={`flex-1 flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                    theme === option.key
                      ? 'bg-purple-100 dark:bg-purple-800/30 text-purple-700 dark:text-purple-200'
                      : 'hover:bg-gray-100 dark:hover:bg-slate-700/50'
                  }`}
                  title={option.label}
                >
                  <option.icon className="w-4 h-4 mb-1" />
                  <span className="text-xs">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
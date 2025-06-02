import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeContext } from '@/contexts/ThemeContext';
import SideNavigation from './SideNavigation';
import { Sun, Moon } from 'lucide-react';

const AppLayout = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="flex h-screen overflow-hidden bg-sanctuary-light dark:bg-sanctuary-dark transition-colors duration-300">
      {/* Side Navigation */}
      <div className="w-16 md:w-64 border-r border-purple-100 dark:border-purple-900">
        <SideNavigation />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-purple-100 dark:border-purple-900 bg-white dark:bg-gray-900">
          <h1 className="text-lg font-medium text-purple-700 dark:text-purple-300">
            Podplay Sanctuary
          </h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-purple-50 dark:hover:bg-gray-800 text-purple-700 dark:text-purple-300 transition-colors"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

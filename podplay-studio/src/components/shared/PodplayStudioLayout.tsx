'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  MessageCircle, 
  Bot, 
  Boxes, 
  ShoppingBag, 
  Grid3x3, 
  Settings, 
  Moon, 
  Sun, 
  Menu, 
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/lib/stores/chat'; // Assuming a global store for dark mode

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/mama-bear', label: 'Mama Bear Chat', icon: MessageCircle },
  { href: '/scout-agent', label: 'Scout Agent', icon: Bot },
  { href: '/dev-workspaces', label: 'Dev Workspaces', icon: Boxes },
  { href: '/mcp-marketplace', label: 'MCP Marketplace', icon: ShoppingBag },
  { href: '/mini-apps', label: 'Mini Apps Hub', icon: Grid3x3 },
  { href: '/integration-workbench', label: 'Integration Workbench', icon: Settings }, // Added Integration Workbench
];

export const PodplayStudioLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { isDarkMode, setIsDarkMode } = useChatStore(); // Or your global theme store
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const theme = {
    bg: isDarkMode ? 'bg-slate-950' : 'bg-podplay-gradient-light', // Define light gradient
    sidebarBg: isDarkMode ? 'bg-slate-900/80 backdrop-blur-md' : 'bg-white/80 backdrop-blur-md',
    text: isDarkMode ? 'text-slate-100' : 'text-slate-800',
    textSecondary: isDarkMode ? 'text-slate-400' : 'text-slate-600',
    activeLink: isDarkMode ? 'bg-podplay-700/50 text-white' : 'bg-podplay-100 text-podplay-700',
    inactiveLink: isDarkMode ? 'hover:bg-podplay-800/50' : 'hover:bg-podplay-50',
    border: isDarkMode ? 'border-slate-700/50' : 'border-slate-300/50',
  };

  return (
    <div className={cn('flex h-screen w-screen overflow-hidden', theme.bg, theme.text)}>
      {/* Sidebar */}
      <aside 
        className={cn(
          'transition-all duration-300 ease-in-out flex flex-col border-r',
          theme.sidebarBg, 
          theme.border,
          isSidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <div className={cn('p-4 flex items-center justify-between border-b', theme.border)}>
          {isSidebarOpen && (
            <Link href="/" className="flex items-center gap-2">
              <img src={isDarkMode ? '/logos/podplay-icon-white.svg' : '/logos/podplay-icon-purple.svg'} alt="Podplay Logo" className="h-8 w-8" />
              <span className="text-xl font-bold bg-gradient-to-r from-podplay-500 to-podplay-600 bg-clip-text text-transparent">
                Podplay
              </span>
            </Link>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn('p-2 rounded-lg', theme.inactiveLink, isSidebarOpen ? '' : 'mx-auto')}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg p-3 transition-colors',
                pathname === item.href ? theme.activeLink : theme.inactiveLink,
                isSidebarOpen ? 'justify-start' : 'justify-center'
              )}
              title={isSidebarOpen ? '' : item.label}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className={cn('p-4 border-t', theme.border)}>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn(
              'w-full flex items-center gap-3 rounded-lg p-3 transition-colors',
              theme.inactiveLink,
              isSidebarOpen ? 'justify-start' : 'justify-center'
            )}
            title={isSidebarOpen ? '' : (isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode')}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            {isSidebarOpen && <span className="text-sm font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <Link
            href="/settings"
            className={cn(
              'mt-2 flex items-center gap-3 rounded-lg p-3 transition-colors',
              pathname === '/settings' ? theme.activeLink : theme.inactiveLink,
              isSidebarOpen ? 'justify-start' : 'justify-center'
            )}
            title={isSidebarOpen ? '' : 'Settings'}
          >
            <Settings size={20} />
            {isSidebarOpen && <span className="text-sm font-medium">Settings</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

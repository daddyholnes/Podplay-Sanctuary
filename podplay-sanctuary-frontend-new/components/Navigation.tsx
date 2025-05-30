
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import ThemeToggle from './ThemeToggle';
import Icon, { IconName } from './Icon';
import { SECTIONS, APP_TITLE } from '../utils/constants';

const Navigation: React.FC = () => {
  const { currentSection, setCurrentSection } = useAppStore();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    const activeSection = SECTIONS.find(s => s.path === currentPath);
    if (activeSection && activeSection.id !== currentSection) {
      setCurrentSection(activeSection.id);
    }
  }, [location, currentSection, setCurrentSection]);

  return (
    <nav className="bg-primary-bg border-b border-border shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2 text-accent hover:text-accent-hover">
            {/* Placeholder logo */}
            <Icon name="academicCap" className="w-8 h-8 text-mama-bear" />
            <span className="font-display text-xl font-semibold text-text-primary">{APP_TITLE}</span>
          </Link>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {SECTIONS.map((section) => (
              <Link
                key={section.id}
                to={section.path}
                onClick={() => setCurrentSection(section.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${currentSection === section.id 
                    ? 'bg-accent-light text-accent font-semibold' 
                    : 'text-text-secondary hover:bg-tertiary-bg hover:text-text-primary'
                  }`}
              >
                <span className="mr-1.5">{section.icon}</span>
                {section.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {/* Placeholder for User Profile/Auth */}
          <button className="p-2 rounded-full hover:bg-tertiary-bg">
            <Icon name="userCircle" className="w-6 h-6 text-text-secondary" />
          </button>
        </div>
      </div>
      {/* Mobile Navigation Tabs (Simplified: hidden for now, could be implemented as bottom tabs or hamburger) */}
       <div className="md:hidden border-t border-border flex justify-around">
        {SECTIONS.map((section) => (
          <Link
            key={section.id}
            to={section.path}
            onClick={() => setCurrentSection(section.id)}
            className={`flex-1 flex flex-col items-center p-2 text-xs
              ${currentSection === section.id 
                ? 'text-accent' 
                : 'text-text-secondary hover:bg-tertiary-bg'
              }`}
          >
            <span className="text-lg">{section.icon}</span>
            <span className="mt-0.5 truncate w-full text-center">{section.name.split(' ')[0]}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
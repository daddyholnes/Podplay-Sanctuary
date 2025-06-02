import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark', // Default to dark theme
  toggleTheme: () => {},
  setTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Check local storage or system preference
  const getInitialTheme = (): Theme => {
    const savedTheme = localStorage.getItem('podplay-theme') as Theme;
    
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Apply theme to document
  const applyTheme = useCallback((newTheme: Theme) => {
    const root = window.document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('podplay-theme', newTheme);
      return newTheme;
    });
  }, []);

  // Set a specific theme
  const changeTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem('podplay-theme', newTheme);
    setTheme(newTheme);
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Initialize and listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (!localStorage.getItem('podplay-theme')) {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

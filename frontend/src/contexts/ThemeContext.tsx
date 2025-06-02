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
  // Check local storage or system preference with fallback
  const getInitialTheme = (): Theme => {
    try {
      const savedTheme = localStorage.getItem('podplay-theme') as Theme;
      
      if (savedTheme) {
        return savedTheme;
      }
      
      // Check system preference safely
      try {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
      } catch (error) {
        console.warn('matchMedia not available, defaulting to dark theme');
        return 'dark'; // Default to dark theme for Podplay's aesthetic
      }
    } catch (error) {
      console.warn('localStorage not available, defaulting to dark theme');
      return 'dark';
    }
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
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        try {
          if (!localStorage.getItem('podplay-theme')) {
            setTheme(mediaQuery.matches ? 'dark' : 'light');
          }
        } catch (error) {
          console.warn('localStorage access failed in mediaQuery handler');
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (error) {
      console.warn('Could not set up matchMedia listener, theme may not auto-update');
      return () => {}; // Empty cleanup function
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      return savedTheme === 'true';
    }
    
    // Check system preference
    if (window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    return false;
  });

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('darkMode', newMode.toString());
      
      // Broadcast theme change to other components/tabs
      window.dispatchEvent(new CustomEvent('theme-changed', { 
        detail: { darkMode: newMode } 
      }));
      
      return newMode;
    });
  };

  const setTheme = (isDark) => {
    setDarkMode(isDark);
    localStorage.setItem('darkMode', isDark.toString());
    
    // Broadcast theme change
    window.dispatchEvent(new CustomEvent('theme-changed', { 
      detail: { darkMode: isDark } 
    }));
  };

  // Apply theme to document
  useEffect(() => {
    const applyTheme = (isDark) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    };

    applyTheme(darkMode);

    // Listen for theme changes from other tabs
    const handleThemeChange = (event) => {
      if (event.detail && typeof event.detail.darkMode === 'boolean') {
        setDarkMode(event.detail.darkMode);
        applyTheme(event.detail.darkMode);
      }
    };

    // Listen for storage changes (other tabs)
    const handleStorageChange = (event) => {
      if (event.key === 'darkMode' && event.newValue !== null) {
        const newDarkMode = event.newValue === 'true';
        setDarkMode(newDarkMode);
        applyTheme(newDarkMode);
      }
    };

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      // Only apply system theme if user hasn't set a preference
      if (localStorage.getItem('darkMode') === null) {
        setDarkMode(e.matches);
        applyTheme(e.matches);
      }
    };

    window.addEventListener('theme-changed', handleThemeChange);
    window.addEventListener('storage', handleStorageChange);
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      window.removeEventListener('theme-changed', handleThemeChange);
      window.removeEventListener('storage', handleStorageChange);
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [darkMode]);

  // Get theme-aware classes
  const getThemeClasses = (lightClasses = '', darkClasses = '') => {
    return darkMode ? darkClasses : lightClasses;
  };

  // Get conditional theme styles
  const themeStyles = {
    background: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    backgroundAlt: darkMode ? 'bg-gray-800' : 'bg-white',
    text: darkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-300' : 'text-gray-600',
    textMuted: darkMode ? 'text-gray-400' : 'text-gray-500',
    border: darkMode ? 'border-gray-700' : 'border-gray-200',
    borderLight: darkMode ? 'border-gray-600' : 'border-gray-100',
    hover: darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
    card: darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    input: darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
    button: {
      primary: darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: darkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900',
      danger: darkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white',
      success: darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
    }
  };

  const value = {
    darkMode,
    toggleDarkMode,
    setTheme,
    getThemeClasses,
    themeStyles
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

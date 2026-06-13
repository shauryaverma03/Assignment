import { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  { id: 'indigo',  name: 'Indigo',  rgb: 'rgb(99 102 241)' },
  { id: 'emerald', name: 'Emerald', rgb: 'rgb(16 185 129)' },
  { id: 'ocean',   name: 'Ocean',   rgb: 'rgb(14 165 233)' },
  { id: 'violet',  name: 'Violet',  rgb: 'rgb(139 92 246)' },
  { id: 'rose',    name: 'Rose',    rgb: 'rgb(244 63 94)' },
  { id: 'amber',   name: 'Amber',   rgb: 'rgb(245 158 11)' },
];

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'indigo');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

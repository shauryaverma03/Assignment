import { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  { id: 'indigo',  name: 'Indigo Dream', desc: 'Indigo → Fuchsia', grad: 'linear-gradient(135deg, #6366f1, #d946ef)' },
  { id: 'emerald', name: 'Mint Fresh',   desc: 'Emerald → Cyan',   grad: 'linear-gradient(135deg, #10b981, #06b6d4)' },
  { id: 'ocean',   name: 'Deep Ocean',   desc: 'Blue → Cyan',      grad: 'linear-gradient(135deg, #2563eb, #06b6d4)' },
  { id: 'sunset',  name: 'Sunset',       desc: 'Orange → Rose',    grad: 'linear-gradient(135deg, #f97316, #f43f5e)' },
  { id: 'violet',  name: 'Violet Bloom', desc: 'Violet → Pink',    grad: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
  { id: 'rose',    name: 'Rose Petal',   desc: 'Rose → Pink',      grad: 'linear-gradient(135deg, #f43f5e, #fb7185)' },
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

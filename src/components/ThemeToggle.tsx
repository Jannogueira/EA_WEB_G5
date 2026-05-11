import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div 
      className={`theme-toggle-switch ${className || ''}`} 
      onClick={toggleTheme} 
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      <div className="theme-toggle-thumb">
        {theme === 'light' ? (
          <Sun className="theme-toggle-icon" />
        ) : (
          <Moon className="theme-toggle-icon" />
        )}
      </div>
    </div>
  );
};

export default ThemeToggle;

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import './ThemeToggle.css';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div
      className={`theme-toggle-switch ${className || ''}`}
      onClick={toggleTheme}
      title={theme === 'light' ? t('theme.switch_dark') : t('theme.switch_light')}
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

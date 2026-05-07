import React from 'react';
import './ThemedBackground.css';

const ThemedBackground: React.FC = () => {
  return (
    <div className="themed-background">
      <div className="gradient-sphere sphere-1"></div>
      <div className="gradient-sphere sphere-2"></div>
      <div className="gradient-sphere sphere-3"></div>
      <div className="glass-overlay"></div>
    </div>
  );
};

export default ThemedBackground;

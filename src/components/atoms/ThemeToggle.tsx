import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('theme') === 'light';
  });

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightMode]);

  return (
    <button 
      onClick={() => setIsLightMode(!isLightMode)}
      style={{
        zIndex: 100,
        background: 'var(--card)',
        border: '1px solid var(--glass-border)',
        borderRadius: '50%',
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'var(--text-main)',
        transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        flexShrink: 0
      }}
      className="theme-toggle-btn"
      title={`切換至${isLightMode ? '暗色' : '亮色'}模式`}
    >
      {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};

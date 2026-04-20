import React from 'react';

const ThemeSwitcher = ({ theme, onThemeChange }) => {
  return (
    <button
      onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
      className="tooltip-chinese"
      data-tip={theme === 'light' ? '墨韵暗色' : '宣纸明色'}
      style={{
        position: 'fixed', 
        bottom: 24, 
        right: 24, 
        zIndex: 1000,
        background: 'rgba(44,24,16,0.75)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(212,163,115,0.4)',
        borderRadius: '50%', 
        width: 52, 
        height: 52, 
        fontSize: 26, 
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        transition: 'all 0.2s'
      }}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeSwitcher;
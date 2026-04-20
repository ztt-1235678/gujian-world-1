import React from 'react';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav style={{
      background: 'rgba(44, 24, 16, 0.96)', 
      backdropFilter: 'blur(14px)', 
      padding: '14px 36px',
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      position: 'sticky', 
      top: 0, 
      zIndex: 100,
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      borderBottom: '1px solid rgba(212,163,115,0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 32 }}>🏯</span>
        <span className="chinese-title" style={{ fontSize: 24, fontWeight: 'bold', color: '#E6B422', letterSpacing: 4 }}>古建智境</span>
        <span className="seal-stamp" style={{ marginLeft: 8, fontSize: 10 }}>雅集</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <span style={{ color: '#F5E6D3', fontFamily: "'Noto Serif SC', serif" }}>👤 {user?.username}</span>
        <button 
          onClick={onLogout} 
          className="tooltip-chinese"
          data-tip="退出登录"
          style={{ 
            background: 'rgba(255,255,255,0.12)', 
            border: '1px solid rgba(255,255,255,0.2)', 
            color: '#F5E6D3', 
            padding: '7px 22px', 
            borderRadius: 40, 
            cursor: 'pointer',
            fontSize: 14,
            transition: 'all 0.2s'
          }}
        >
          退出
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
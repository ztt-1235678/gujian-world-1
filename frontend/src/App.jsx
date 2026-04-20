import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AudioClick from './components/AudioClick';
import ThemeSwitcher from './components/ThemeSwitcher';
import ScrollReveal from './components/ScrollReveal';
import ChineseDeco from './components/ChineseDeco';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.body.className = savedTheme;
    
    // 添加云纹元素
    const clouds = ['cloud-1', 'cloud-2', 'cloud-3', 'cloud-4'];
    clouds.forEach(className => {
      if (!document.querySelector(`.${className}`)) {
        const div = document.createElement('div');
        div.className = `cloud ${className}`;
        document.body.appendChild(div);
      }
    });

    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          setUser(data);
          setIsAuthenticated(true);
          if (data.theme) {
            setTheme(data.theme);
            document.body.className = data.theme;
          }
        })
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
    if (userData.theme) {
      setTheme(userData.theme);
      document.body.className = userData.theme;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.body.className = newTheme;
    localStorage.setItem('theme', newTheme);
    if (isAuthenticated) {
      fetch('/api/auth/theme', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ theme: newTheme })
      }).catch(console.error);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        paddingTop: '35vh',
        background: '#e8dccc',
        minHeight: '100vh'
      }}>
        <div className="loading-bar" style={{ width: '200px', margin: '0 auto 20px' }} />
        <div className="chinese-text" style={{ color: '#8B4513' }}>墨韵加载中...</div>
      </div>
    );
  }

  return (
    <Router>
      <ChineseDeco />
      <AudioClick />
      <ThemeSwitcher theme={theme} onThemeChange={handleThemeChange} />
      <ScrollReveal />
      <Toaster 
        position="top-center" 
        toastOptions={{ 
          duration: 2500, 
          style: { 
            background: '#2C1810', 
            color: '#F5E6D3',
            fontFamily: "'Noto Serif SC', serif",
            borderRadius: '30px'
          } 
        }} 
      />
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onRegister={handleLogin} />} />
        <Route path="/dashboard" element={
          isAuthenticated ? <Dashboard user={user} onLogout={handleLogout} theme={theme} /> : <Navigate to="/login" />
        } />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('请填写用户名和密码');
      return;
    }
    setLoading(true);
    try {
      console.log('登录请求发送:', { username, password });
      const res = await axios.post('/api/auth/login', { username, password });
      console.log('登录响应:', res.data);
      
      if (res.data.token && res.data.user) {
        onLogin(res.data.token, res.data.user);
        toast.success('登录成功！');
        navigate('/dashboard');
      } else {
        toast.error('登录响应异常');
      }
    } catch (err) {
      console.error('登录错误:', err);
      toast.error(err.response?.data?.error || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="window-frame" style={{ maxWidth: 450, width: '100%', padding: 42, background: '#FFF8F0' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span style={{ fontSize: 64 }}>🏯</span>
          <h1 className="chinese-title" style={{ fontSize: 36, marginTop: 12, color: '#5C2E0A', letterSpacing: 6 }}>古建智境</h1>
          <div className="chinese-divider" />
          <p className="chinese-text" style={{ color: '#8B4513', marginTop: 8 }}>登录以继续</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="用户名" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            className="chinese-text"
            style={{ width: '100%', padding: 14, marginBottom: 20, borderRadius: 40, border: '1px solid #D4A373', background: 'white', fontSize: 15 }} 
          />
          <input 
            type="password" 
            placeholder="密码" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="chinese-text"
            style={{ width: '100%', padding: 14, marginBottom: 32, borderRadius: 40, border: '1px solid #D4A373', background: 'white', fontSize: 15 }} 
          />
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 16 }} disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link to="/register" className="chinese-text" style={{ color: '#8B4513', textDecoration: 'none' }}>没有账号？立即注册</Link>
        </div>
        <div className="huiwen-border" style={{ marginTop: 28 }} />
        <div className="signature" style={{ textAlign: 'center', marginTop: 16, fontSize: 12 }}>
          传承 · 创新
        </div>
      </div>
    </div>
  );
};

export default Login;
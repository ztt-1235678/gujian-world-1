import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Register = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      toast.error('请填写所有字段');
      return;
    }
    if (password.length < 6) {
      toast.error('密码至少6位');
      return;
    }
    setLoading(true);
    try {
      console.log('注册请求发送:', { username, email, password });
      const res = await axios.post('/api/auth/register', { username, email, password });
      console.log('注册响应:', res.data);
      
      if (res.data.token && res.data.user) {
        onRegister(res.data.token, res.data.user);
        toast.success('注册成功！');
        navigate('/dashboard');
      } else {
        toast.error('注册响应异常');
      }
    } catch (err) {
      console.error('注册错误:', err);
      toast.error(err.response?.data?.error || '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="window-frame" style={{ maxWidth: 480, width: '100%', padding: 42, background: '#FFF8F0' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span style={{ fontSize: 64 }}>📜</span>
          <h1 className="chinese-title" style={{ fontSize: 36, marginTop: 12, color: '#5C2E0A', letterSpacing: 6 }}>古建智境</h1>
          <div className="chinese-divider" />
        </div>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="用户名" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            className="chinese-text"
            style={{ width: '100%', padding: 14, marginBottom: 18, borderRadius: 40, border: '1px solid #D4A373', background: 'white' }} 
          />
          <input 
            type="email" 
            placeholder="邮箱" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="chinese-text"
            style={{ width: '100%', padding: 14, marginBottom: 18, borderRadius: 40, border: '1px solid #D4A373', background: 'white' }} 
          />
          <input 
            type="password" 
            placeholder="密码 (至少6位)" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="chinese-text"
            style={{ width: '100%', padding: 14, marginBottom: 32, borderRadius: 40, border: '1px solid #D4A373', background: 'white' }} 
          />
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 16 }} disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link to="/login" className="chinese-text" style={{ color: '#8B4513', textDecoration: 'none' }}>已有账号？去登录</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
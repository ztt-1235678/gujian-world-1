import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const WorldShare = () => {
  const [shareCode, setShareCode] = useState('');
  const [importCode, setImportCode] = useState('');

  const handleShare = async () => {
    const token = localStorage.getItem('token');
    if (!token) return toast.error('请先登录');
    try {
      const res = await axios.post('/api/world/save', { worldData: {}, isPublic: true }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShareCode(res.data.shareCode);
      toast.success('分享码已生成');
    } catch (err) {
      toast.error('分享失败');
    }
  };

  const handleImport = async () => {
    if (!importCode.trim()) return toast.error('请输入分享码');
    const token = localStorage.getItem('token');
    if (!token) return toast.error('请先登录');
    try {
      await axios.post('/api/share/import', { shareCode: importCode }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('导入成功，刷新游戏即可查看');
      setImportCode('');
    } catch (err) {
      toast.error('分享码无效或已过期');
    }
  };

  return (
    <div className="ink-wash">
      <h2 className="chinese-title" style={{ fontSize: 30, textAlign: 'center', color: '#5C2E0A' }}>🔗 世界分享</h2>
      <div className="chinese-divider" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="window-frame" style={{ background: 'white', padding: 24 }}>
          <h3 className="chinese-text" style={{ marginBottom: 12 }}>分享你的世界</h3>
          <p className="chinese-text" style={{ marginBottom: 16, fontSize: 14, color: '#666' }}>生成分享码，好友可导入你的建筑世界</p>
          <button onClick={handleShare} className="btn-primary">生成分享码</button>
          {shareCode && (
            <div style={{ marginTop: 18, padding: 14, background: '#f0e4d0', borderRadius: 16 }}>
              <strong className="chinese-text">分享码：</strong> 
              <span style={{ fontFamily: 'monospace', fontSize: 18, marginLeft: 10 }}>{shareCode}</span>
            </div>
          )}
        </div>
        <div className="window-frame" style={{ background: 'white', padding: 24 }}>
          <h3 className="chinese-text" style={{ marginBottom: 12 }}>导入好友世界</h3>
          <div style={{ display: 'flex', gap: 14, marginTop: 12 }}>
            <input 
              type="text" 
              placeholder="输入分享码" 
              value={importCode} 
              onChange={e => setImportCode(e.target.value)} 
              className="chinese-text"
              style={{ flex: 1, padding: 12, borderRadius: 40, border: '1px solid #D4A373' }} 
            />
            <button onClick={handleImport} className="btn-secondary">导入</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldShare;
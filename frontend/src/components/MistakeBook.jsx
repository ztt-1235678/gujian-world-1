import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const MistakeBook = () => {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMistakes = async () => {
    try {
      const res = await axios.get('/api/mistake', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMistakes(res.data.mistakes);
    } catch (err) {
      toast.error('获取错题失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMistakes();
  }, []);

  const deleteMistake = async (id) => {
    try {
      await axios.delete(`/api/mistake/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMistakes(mistakes.filter(m => m.id !== id));
      toast.success('已删除');
    } catch (err) {
      toast.error('删除失败');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div className="loading-bar" style={{ width: '100px', margin: '0 auto 16px' }} />
        <div className="chinese-text">翻阅错题本...</div>
      </div>
    );
  }

  return (
    <div className="ink-wash">
      <h2 className="chinese-title" style={{ fontSize: 30, textAlign: 'center', color: '#5C2E0A' }}>📒 错题本</h2>
      <div className="chinese-divider" />
      {mistakes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 70, color: '#999' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📘</div>
          <div className="chinese-text">暂无错题，继续保持！</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {mistakes.map((m, idx) => (
            <div key={m.id} className="window-frame" style={{ background: 'white', padding: 18, borderLeft: '4px solid #E34234' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <strong className="chinese-text">错题 #{idx+1}</strong>
                <button onClick={() => deleteMistake(m.id)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#E34234' }}>✕</button>
              </div>
              <p className="chinese-text">你的答案：{m.userAnswer !== undefined ? `选项 ${String.fromCharCode(65+m.userAnswer)}` : '未选'}</p>
              <p className="chinese-text">正确答案：{m.correctAnswer}</p>
              <p className="chinese-text" style={{ fontSize: 12, color: '#666', marginTop: 8 }}>记录时间：{new Date(m.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MistakeBook;
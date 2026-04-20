import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LearningPathView = () => {
  const [pathData, setPathData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const res = await axios.get('/api/learning-path', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setPathData(res.data);
      } catch (err) {
        toast.error('获取学习路径失败');
      } finally {
        setLoading(false);
      }
    };
    fetchPath();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div className="loading-bar" style={{ width: '100px', margin: '0 auto 16px' }} />
        <div className="chinese-text">加载学习路径...</div>
      </div>
    );
  }

  if (!pathData) return null;

  return (
    <div className="ink-wash">
      <h2 className="chinese-title" style={{ fontSize: 30, textAlign: 'center', color: '#5C2E0A' }}>🗺️ 学习路径</h2>
      <div className="chinese-divider" />
      
      <div className="window-frame" style={{ background: 'white', padding: 24, marginBottom: 24 }}>
        <h3 className="chinese-text" style={{ fontSize: 20, marginBottom: 8 }}>当前阶段：{pathData.currentStage?.name}</h3>
        <p className="chinese-text" style={{ color: '#666', fontSize: 14 }}>{pathData.currentStage?.description}</p>
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
            <span className="chinese-text">学习进度</span>
            <span className="chinese-text">{pathData.progress}%</span>
          </div>
          <div style={{ height: 8, background: '#e0d6c8', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${pathData.progress}%`, height: '100%', background: 'linear-gradient(90deg, #E6B422, #8B4513)' }} />
          </div>
          <div className="chinese-text" style={{ marginTop: 14, fontSize: 13, color: '#666' }}>
            已学习 {pathData.articlesRead} 篇文章
          </div>
        </div>
      </div>

      {pathData.nextStage && (
        <div className="window-frame" style={{ background: '#f0e4d0', padding: 24 }}>
          <h3 className="chinese-text" style={{ fontSize: 18, marginBottom: 8 }}>下一阶段：{pathData.nextStage.name}</h3>
          <p className="chinese-text" style={{ color: '#666', fontSize: 14, marginBottom: 12 }}>{pathData.nextStage.description}</p>
          <div className="chinese-text" style={{ fontSize: 13 }}>
            需要学习 {pathData.nextStage.requiredArticles} 篇文章解锁
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPathView;
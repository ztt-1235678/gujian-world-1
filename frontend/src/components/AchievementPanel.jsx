import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AchievementPanel = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await axios.get('/api/achievement', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAchievements(res.data.achievements);
      } catch (err) {
        toast.error('获取成就失败');
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div className="loading-bar" style={{ width: '100px', margin: '0 auto 16px' }} />
        <div className="chinese-text">加载成就殿堂...</div>
      </div>
    );
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="ink-wash">
      <h2 className="chinese-title" style={{ fontSize: 30, textAlign: 'center', color: '#5C2E0A' }}>🏆 成就殿堂</h2>
      <div className="chinese-divider" />
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 52, fontWeight: 'bold', color: '#E6B422' }}>{unlockedCount} / {achievements.length}</div>
        <div className="chinese-text" style={{ fontSize: 14 }}>已解锁成就</div>
        <div style={{ width: '200px', height: 6, background: '#e0d6c8', borderRadius: 3, margin: '12px auto', overflow: 'hidden' }}>
          <div style={{ width: `${(unlockedCount / achievements.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #E6B422, #8B4513)' }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
        {achievements.map((ach, idx) => (
          <div 
            key={idx} 
            className="window-frame" 
            style={{ 
              background: ach.unlocked ? 'white' : '#f5f0e8', 
              padding: 18, 
              textAlign: 'center', 
              opacity: ach.unlocked ? 1 : 0.7,
              border: ach.unlocked ? '1px solid #E6B422' : '1px solid #e0d6c8'
            }}
          >
            <div style={{ fontSize: 44, filter: ach.unlocked ? 'none' : 'grayscale(0.4)' }}>{ach.icon}</div>
            <div className="chinese-text" style={{ fontSize: 17, fontWeight: 'bold', marginTop: 8 }}>{ach.name}</div>
            <div className="chinese-text" style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{ach.description}</div>
            {ach.unlocked && <div className="seal-stamp" style={{ marginTop: 12, fontSize: 10 }}>已解锁</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementPanel;
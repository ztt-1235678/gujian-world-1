import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RecommendList = () => {
  const [recommends, setRecommends] = useState([]);

  useEffect(() => {
    const fetchRecommends = async () => {
      try {
        const res = await axios.get('/api/recommend', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setRecommends(res.data.recommendations);
      } catch (err) {
        console.error('推荐失败');
      }
    };
    fetchRecommends();
  }, []);

  if (recommends.length === 0) return null;

  return (
    <div className="window-frame" style={{ background: 'rgba(255,248,240,0.85)', padding: '16px 20px', marginBottom: 20 }}>
      <div className="chinese-text" style={{ fontSize: 14, color: '#8B4513', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>📌</span> 为你推荐
        <span className="seal-stamp" style={{ fontSize: 9, marginLeft: 8 }}>智选</span>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {recommends.map(rec => (
          <span key={rec.id} className="chinese-text" style={{ background: 'white', padding: '6px 18px', borderRadius: 30, fontSize: 13, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            {rec.title}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RecommendList;
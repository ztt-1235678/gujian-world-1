import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BuildingScore = () => {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const user = JSON.parse(atob(token.split('.')[1]));
        const res = await axios.get(`/api/building-score/${user.userId}`);
        setScore(res.data.score || 0);
      } catch (err) {
        console.error('获取评分失败');
      }
    };
    fetchScore();
  }, []);

  const getScoreColor = (s) => {
    if (s >= 90) return '#E6B422';
    if (s >= 80) return '#D4AF37';
    if (s >= 70) return '#8B4513';
    if (s >= 60) return '#B87C4E';
    return '#E34234';
  };

  const getScoreLevel = (s) => {
    if (s >= 90) return '营造宗师';
    if (s >= 80) return '营造大师';
    if (s >= 70) return '能工巧匠';
    if (s >= 60) return '初出茅庐';
    return '学徒';
  };

  return (
    <div className="tooltip-chinese" data-tip="AI对您建筑的评分" style={{ 
      background: 'linear-gradient(135deg, #FFF8F0, #F5E6D3)', 
      borderRadius: 28, 
      padding: '12px 28px', 
      textAlign: 'center',
      border: `2px solid ${getScoreColor(score)}`,
      minWidth: 140
    }}>
      <div className="chinese-text" style={{ fontSize: 13, color: '#8B4513' }}>🏆 建筑评分</div>
      <div style={{ fontSize: 36, fontWeight: 'bold', color: getScoreColor(score) }}>{score}</div>
      <div className="chinese-text" style={{ fontSize: 12, color: '#666' }}>{getScoreLevel(score)}</div>
    </div>
  );
};

export default BuildingScore;
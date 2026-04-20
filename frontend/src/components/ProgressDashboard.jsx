import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const ProgressDashboard = () => {
  const [stats, setStats] = useState({ viewedArticles: 0, mistakeCount: 0, accuracy: 0, achievements: 0, totalTime: 0 });
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/progress/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setStats(res.data);
      } catch (err) {
        toast.error('获取进度失败');
      }
    };
    fetchStats();
  }, []);

  const doughnutData = {
    labels: ['正确', '错误'],
    datasets: [{ data: [stats.accuracy, 100 - stats.accuracy], backgroundColor: ['#8B4513', '#D4A373'] }]
  };
  
  const totalMinutes = Math.floor(stats.totalTime / 60);

  return (
    <div className="ink-wash">
      <h2 className="chinese-title" style={{ fontSize: 30, textAlign: 'center', color: '#5C2E0A' }}>📊 学习进度</h2>
      <div className="chinese-divider" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 20, marginTop: 20 }}>
        <div className="window-frame" style={{ background: 'white', padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 42 }}>📖</div>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#8B4513' }}>{stats.viewedArticles}</div>
          <div className="chinese-text" style={{ fontSize: 13 }}>已学习文章</div>
        </div>
        <div className="window-frame" style={{ background: 'white', padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 42 }}>📝</div>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#8B4513' }}>{stats.mistakeCount}</div>
          <div className="chinese-text" style={{ fontSize: 13 }}>错题总数</div>
        </div>
        <div className="window-frame" style={{ background: 'white', padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 42 }}>✅</div>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#8B4513' }}>{stats.accuracy}%</div>
          <div className="chinese-text" style={{ fontSize: 13 }}>正确率</div>
        </div>
        <div className="window-frame" style={{ background: 'white', padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 42 }}>🏆</div>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#8B4513' }}>{stats.achievements}</div>
          <div className="chinese-text" style={{ fontSize: 13 }}>获得成就</div>
        </div>
        <div className="window-frame" style={{ background: 'white', padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 42 }}>⏱️</div>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#8B4513' }}>{totalMinutes}</div>
          <div className="chinese-text" style={{ fontSize: 13 }}>学习分钟</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, marginTop: 24 }}>
        <div className="window-frame" style={{ background: 'white', padding: 24, maxWidth: 400, margin: '0 auto' }}>
          <h3 className="chinese-text" style={{ textAlign: 'center', marginBottom: 16 }}>正确率分布</h3>
          <Doughnut data={doughnutData} options={{ responsive: true }} />
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
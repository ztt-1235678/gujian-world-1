import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DataVisualization = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('/api/world/leaderboard');
        setLeaderboard(res.data.leaderboard || []);
      } catch (err) {
        console.error('获取排行榜失败');
      }
    };
    fetchLeaderboard();
  }, []);

  if (leaderboard.length === 0) return null;

  const chartData = {
    labels: leaderboard.slice(0, 5).map((_, i) => `第${i+1}名`),
    datasets: [{
      label: '建筑评分',
      data: leaderboard.slice(0, 5).map(l => l.score),
      backgroundColor: '#8B4513',
      borderRadius: 8
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'top', labels: { font: { family: "'Noto Serif SC', serif" } } }
    }
  };

  return (
    <div className="window-frame" style={{ background: 'rgba(255,248,240,0.85)', padding: 24, marginTop: 24 }}>
      <h3 className="chinese-text" style={{ textAlign: 'center', marginBottom: 20, color: '#5C2E0A' }}>🏆 营造大师榜</h3>
      <Bar data={chartData} options={options} />
      <div className="signature" style={{ marginTop: 16, fontSize: 11 }}>数据实时更新</div>
    </div>
  );
};

export default DataVisualization;
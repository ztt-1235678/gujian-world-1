import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import LearningModule from '../components/LearningModule';
import QuizModule from '../components/QuizModule';
import KnowledgeCard from '../components/KnowledgeCard';
import GameModule from '../components/GameModule';
import AIModule from '../components/AIModule';
import ScreenshotButton from '../components/ScreenshotButton';
import ProgressDashboard from '../components/ProgressDashboard';
import MistakeBook from '../components/MistakeBook';
import WorldShare from '../components/WorldShare';
import RecommendList from '../components/RecommendList';
import MobileDetect from '../components/MobileDetect';
import AchievementPanel from '../components/AchievementPanel';
import LearningPathView from '../components/LearningPathView';
import Multiplayer from '../components/Multiplayer';
import BuildingGenerator from '../components/BuildingGenerator';
import BuildingScore from '../components/BuildingScore';
import VoiceInput from '../components/VoiceInput';
import Tutorial from '../components/Tutorial';
import ArchitectureDrawing from '../components/ArchitectureDrawing';
import DataVisualization from '../components/DataVisualization';
import ChineseDeco from '../components/ChineseDeco';

const Dashboard = ({ user, onLogout, theme }) => {
  const [activeTab, setActiveTab] = useState('learn');

  const tabs = [
    { id: 'learn', name: '📖 古建学堂' },
    { id: 'quiz', name: '📝 知识测验' },
    { id: 'game', name: '🏯 营造法式' },
    { id: 'ai', name: '🤖 智语古建' },
    { id: 'progress', name: '📊 学习进度' },
    { id: 'mistake', name: '📒 错题本' },
    { id: 'share', name: '🔗 世界分享' },
    { id: 'achievement', name: '🏆 成就殿堂' },
    { id: 'path', name: '🗺️ 学习路径' },
    { id: 'multiplayer', name: '👥 多人协作' },
    { id: 'generate', name: '✨ AI生成' }
  ];

  useEffect(() => {
    document.body.style.overflowY = 'auto';
    return () => { document.body.style.overflowY = 'auto'; };
  }, []);

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <ChineseDeco />
      <MobileDetect />
      <Tutorial />
      <Navbar user={user} onLogout={onLogout} />
      <div className="page-container">
        {/* 顶部卡片区 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
          <KnowledgeCard />
          <BuildingScore />
        </div>
        
        {/* 推荐列表 */}
        <RecommendList />
        
        {/* 建筑线图 */}
        <ArchitectureDrawing />
        
        {/* 选项卡导航 */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap', marginTop: 20 }}>
          {tabs.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className="tooltip-chinese"
              data-tip={tab.name}
              style={{
                padding: '10px 26px',
                fontSize: 15,
                background: activeTab === tab.id ? 'linear-gradient(135deg, #8B4513, #5C2E0A)' : 'rgba(139,69,19,0.08)',
                border: 'none',
                borderRadius: 40,
                color: activeTab === tab.id ? 'white' : '#5C2E0A',
                cursor: 'pointer',
                fontFamily: "'Noto Serif SC', serif",
                transition: 'all 0.2s',
                letterSpacing: '1px'
              }}
            >
              {tab.name}
            </button>
          ))}
        </div>
        
        {/* 内容区域 */}
        <div className="window-frame" style={{ padding: 28, borderRadius: 32 }}>
          {activeTab === 'learn' && <LearningModule />}
          {activeTab === 'quiz' && <QuizModule />}
          {activeTab === 'game' && <GameModule />}
          {activeTab === 'ai' && <AIModule />}
          {activeTab === 'progress' && <ProgressDashboard />}
          {activeTab === 'mistake' && <MistakeBook />}
          {activeTab === 'share' && <WorldShare />}
          {activeTab === 'achievement' && <AchievementPanel />}
          {activeTab === 'path' && <LearningPathView />}
          {activeTab === 'multiplayer' && <Multiplayer />}
          {activeTab === 'generate' && <BuildingGenerator />}
        </div>
        
        {/* 底部工具栏 */}
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
          <VoiceInput />
          <ScreenshotButton />
        </div>
        
        {/* 数据可视化 */}
        <DataVisualization />
        
        {/* 底部落款 */}
        <div className="signature" style={{ textAlign: 'center', marginTop: 40, fontSize: 12 }}>
          古建智境 · 传承中华营造智慧
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const KnowledgeCard = () => {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    axios.get('/api/knowledge/cards').then(res => setCards(res.data)).catch(console.error);
  }, []);

  const nextCard = () => {
    setFlipped(true);
    setTimeout(() => {
      if (cards.length) setCurrentIndex((prev) => (prev + 1) % cards.length);
      setFlipped(false);
    }, 200);
  };

  if (!cards.length) return null;

  return (
    <div 
      onClick={nextCard} 
      className="scroll-reveal tooltip-chinese"
      data-tip="点击切换卡片"
      style={{ 
        background: 'linear-gradient(135deg, #FFF8F0, #F5E6D3)', 
        borderRadius: 28, 
        padding: '20px 28px', 
        cursor: 'pointer',
        textAlign: 'center', 
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)', 
        border: '1px solid #e0c8a8',
        transition: 'transform 0.2s'
      }}
    >
      <div style={{ fontSize: 13, letterSpacing: 2, color: '#8B4513', marginBottom: 8 }}>📜 知识卡片 · 点击切换</div>
      <div className="chinese-title" style={{ fontSize: 24, fontWeight: 'bold', margin: '10px 0', color: '#5C2E0A' }}>
        {cards[currentIndex]?.title}
      </div>
      <div className="chinese-text" style={{ color: '#2C1810', fontSize: 15, lineHeight: 1.6 }}>
        {cards[currentIndex]?.content}
      </div>
      <div className="huiwen-border" style={{ marginTop: 16, marginBottom: 0 }} />
    </div>
  );
};

export default KnowledgeCard;
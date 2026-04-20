import React, { useState } from 'react';

const ArchitectureDrawing = () => {
  const [activeDrawing, setActiveDrawing] = useState('yingxian');

  const drawings = {
    yingxian: {
      name: '应县木塔剖面图',
      description: '佛宫寺释迦塔，建于辽清宁二年（1056年），高67.31米，世界现存最高最古老木塔。五层六檐，暗层四层，共九层。',
      svg: `<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
        <rect x="180" y="20" width="40" height="80" fill="none" stroke="#5C2E0A" stroke-width="1.5"/>
        <rect x="170" y="100" width="60" height="10" fill="none" stroke="#5C2E0A" stroke-width="1"/>
        <rect x="175" y="110" width="50" height="60" fill="none" stroke="#5C2E0A" stroke-width="1"/>
        <rect x="170" y="170" width="60" height="10" fill="none" stroke="#5C2E0A" stroke-width="1"/>
        <rect x="175" y="180" width="50" height="60" fill="none" stroke="#5C2E0A" stroke-width="1"/>
        <rect x="170" y="240" width="60" height="10" fill="none" stroke="#5C2E0A" stroke-width="1"/>
        <rect x="175" y="250" width="50" height="60" fill="none" stroke="#5C2E0A" stroke-width="1"/>
        <rect x="170" y="310" width="60" height="10" fill="none" stroke="#5C2E0A" stroke-width="1"/>
        <rect x="175" y="320" width="50" height="60" fill="none" stroke="#5C2E0A" stroke-width="1"/>
        <rect x="160" y="380" width="80" height="15" fill="none" stroke="#5C2E0A" stroke-width="1.5"/>
        <rect x="150" y="395" width="100" height="10" fill="none" stroke="#5C2E0A" stroke-width="1.5"/>
        <rect x="140" y="405" width="120" height="8" fill="none" stroke="#5C2E0A" stroke-width="1.5"/>
        <line x1="200" y1="20" x2="200" y2="413" stroke="#D4A373" stroke-width="0.5" stroke-dasharray="3,3"/>
        <text x="200" y="440" text-anchor="middle" fill="#5C2E0A" font-size="12" font-family="'Noto Serif SC', serif">应县木塔结构示意图</text>
        <text x="200" y="458" text-anchor="middle" fill="#8B4513" font-size="10" font-family="'Noto Serif SC', serif">五层六檐，暗层四层，共九层</text>
      </svg>`
    },
    foguang: {
      name: '佛光寺东大殿剖面图',
      description: '五台山佛光寺东大殿，建于唐大中十一年（857年），中国现存最完整唐代木构。面阔七间，进深四间，单檐庑殿顶。',
      svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <rect x="100" y="280" width="30" height="80" fill="none" stroke="#5C2E0A" stroke-width="1.5"/>
        <rect x="270" y="280" width="30" height="80" fill="none" stroke="#5C2E0A" stroke-width="1.5"/>
        <rect x="120" y="270" width="160" height="15" fill="none" stroke="#5C2E0A" stroke-width="1"/>
        <rect x="130" y="250" width="140" height="20" fill="none" stroke="#5C2E0A" stroke-width="1"/>
        <rect x="140" y="220" width="120" height="30" fill="none" stroke="#5C2E0A" stroke-width="1"/>
        <path d="M100,220 L200,120 L300,220" fill="none" stroke="#5C2E0A" stroke-width="1.5"/>
        <path d="M120,220 L200,140 L280,220" fill="none" stroke="#5C2E0A" stroke-width="1"/>
        <rect x="185" y="200" width="30" height="50" fill="none" stroke="#5C2E0A" stroke-width="1"/>
        <text x="200" y="380" text-anchor="middle" fill="#5C2E0A" font-size="12" font-family="'Noto Serif SC', serif">佛光寺东大殿结构示意图</text>
        <text x="200" y="395" text-anchor="middle" fill="#8B4513" font-size="10" font-family="'Noto Serif SC', serif">面阔七间，进深四间，单檐庑殿顶</text>
      </svg>`
    },
    dougong: {
      name: '斗拱结构分解图',
      description: '斗拱由斗、拱、昂、枋等构件组成，宋代《营造法式》称为“铺作”。以“材”为模数单位。',
      svg: `<svg viewBox="0 0 400 350" xmlns="http://www.w3.org/2000/svg">
        <rect x="180" y="300" width="40" height="30" fill="none" stroke="#5C2E0A" stroke-width="1.5"/>
        <rect x="170" y="280" width="60" height="20" fill="none" stroke="#5C2E0A" stroke-width="1"/>
        <rect x="160" y="250" width="80" height="30" fill="none" stroke="#5C2E0A" stroke-width="1"/>
        <rect x="150" y="220" width="100" height="30" fill="none" stroke="#5C2E0A" stroke-width="1"/>
        <rect x="140" y="190" width="120" height="30" fill="none" stroke="#5C2E0A" stroke-width="1"/>
        <rect x="190" y="170" width="20" height="20" fill="none" stroke="#5C2E0A" stroke-width="1"/>
        <circle cx="200" cy="180" r="5" fill="#5C2E0A"/>
        <text x="100" y="240" fill="#5C2E0A" font-size="10" font-family="'Noto Serif SC', serif">华拱</text>
        <text x="100" y="270" fill="#5C2E0A" font-size="10" font-family="'Noto Serif SC', serif">泥道拱</text>
        <text x="100" y="300" fill="#5C2E0A" font-size="10" font-family="'Noto Serif SC', serif">栌斗</text>
        <text x="250" y="200" fill="#5C2E0A" font-size="10" font-family="'Noto Serif SC', serif">昂嘴</text>
        <text x="200" y="340" text-anchor="middle" fill="#5C2E0A" font-size="12" font-family="'Noto Serif SC', serif">斗拱构件分解图</text>
      </svg>`
    }
  };

  return (
    <div className="window-frame" style={{ marginTop: 28 }}>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
        {Object.entries(drawings).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setActiveDrawing(key)}
            className="tooltip-chinese"
            data-tip={val.name}
            style={{
              padding: '8px 24px',
              background: activeDrawing === key ? 'linear-gradient(135deg, #8B4513, #5C2E0A)' : 'rgba(139,69,19,0.08)',
              border: 'none',
              borderRadius: 40,
              color: activeDrawing === key ? 'white' : '#5C2E0A',
              cursor: 'pointer',
              fontSize: 14,
              fontFamily: "'Noto Serif SC', serif",
              transition: 'all 0.2s'
            }}
          >
            {val.name}
          </button>
        ))}
      </div>
      <div style={{ textAlign: 'center' }}>
        <div dangerouslySetInnerHTML={{ __html: drawings[activeDrawing].svg }} />
        <p className="chinese-text" style={{ marginTop: 20, fontSize: 14, color: '#666', maxWidth: 450, margin: '20px auto 0', lineHeight: 1.7 }}>
          {drawings[activeDrawing].description}
        </p>
        <div className="signature" style={{ marginTop: 20 }}>
          据《中国古代建筑史》绘制
        </div>
      </div>
    </div>
  );
};

export default ArchitectureDrawing;
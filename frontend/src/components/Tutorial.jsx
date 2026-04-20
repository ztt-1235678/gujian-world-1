import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const Tutorial = () => {
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('tutorial_seen');
    if (!hasSeen) {
      setTimeout(() => setShow(true), 800);
    }
  }, []);

  const steps = [
    { title: '🏯 欢迎来到古建智境', content: '这里是学习古建筑知识、创造属于你自己的古建世界的平台。', icon: '🏯' },
    { title: '📖 古建学堂', content: '点击任意文章卡片，学习古建筑知识。每篇文章都包含《营造法式》原典引用。', icon: '📖' },
    { title: '🏗️ 营造法式游戏', content: '双击地面放置方块，Shift+双击拆除。尝试建造一座亭台或楼阁！', icon: '🏗️' },
    { title: '🤖 智语AI', content: '可以向AI提问任何古建筑问题，也可以使用语音输入。', icon: '🤖' },
    { title: '🏆 成就系统', content: '学习文章、完成测验、建造建筑都能解锁成就徽章。', icon: '🏆' }
  ];

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setShow(false);
      localStorage.setItem('tutorial_seen', 'true');
      toast.success('开启古建之旅！');
    }
  };

  const skipTutorial = () => {
    setShow(false);
    localStorage.setItem('tutorial_seen', 'true');
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="window-frame" style={{
        background: '#FFF8F0',
        maxWidth: 450,
        width: '90%',
        padding: 32,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>{steps[step].icon}</div>
        <h3 className="chinese-title" style={{ fontSize: 24, color: '#8B4513', marginBottom: 12 }}>{steps[step].title}</h3>
        <p className="chinese-text" style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 24, color: '#2C1810' }}>
          {steps[step].content}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          {step < steps.length - 1 ? (
            <>
              <button onClick={skipTutorial} className="btn-secondary">跳过引导</button>
              <button onClick={nextStep} className="btn-primary">下一步 →</button>
            </>
          ) : (
            <button onClick={nextStep} className="btn-primary">开始体验</button>
          )}
        </div>
        <div style={{ marginTop: 20, fontSize: 12, color: '#999' }}>
          第 {step + 1} / {steps.length} 步
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
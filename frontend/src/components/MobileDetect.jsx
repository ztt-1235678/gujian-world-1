import React, { useEffect, useState } from 'react';

const MobileDetect = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <div style={{ 
      background: '#E6B422', 
      color: '#2C1810', 
      textAlign: 'center', 
      padding: '10px', 
      fontSize: 13,
      fontFamily: "'Noto Serif SC', serif"
    }}>
      📱 移动端适配中，推荐使用电脑获得最佳建造体验
    </div>
  );
};

export default MobileDetect;
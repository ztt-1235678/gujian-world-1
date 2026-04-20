import React from 'react';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

const ScreenshotButton = () => {
  const capture = async () => {
    try {
      const element = document.querySelector('.page-container') || document.body;
      const canvas = await html2canvas(element, { 
        scale: 2, 
        backgroundColor: '#faf3e8',
        logging: false,
        useCORS: true
      });
      const link = document.createElement('a');
      link.download = `古建智境_${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast.success('截图已保存至相册');
    } catch (err) {
      toast.error('截图失败');
    }
  };

  return (
    <button onClick={capture} className="btn-secondary tooltip-chinese" data-tip="保存当前页面为图片" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      📸 截图分享
    </button>
  );
};

export default ScreenshotButton;
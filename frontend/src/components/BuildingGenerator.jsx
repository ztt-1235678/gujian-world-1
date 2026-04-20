import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const BuildingGenerator = () => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('请输入建筑描述');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/ai/generate-building', { description });
      setGenerated(res.data);
      toast.success(`生成成功！共 ${res.data.blocks?.length || 0} 个构件`);
    } catch (err) {
      toast.error('生成失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ink-wash">
      <h2 className="chinese-title" style={{ fontSize: 30, textAlign: 'center', color: '#5C2E0A' }}>✨ AI古建生成器</h2>
      <div className="chinese-divider" />
      <div className="window-frame" style={{ background: 'white', padding: 28 }}>
        <p className="chinese-text" style={{ marginBottom: 20, color: '#666' }}>
          用文字描述你想要的古建筑，AI将自动生成结构
        </p>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="例如：一座三层的唐代佛塔，有飞檐和斗拱..."
          rows={3}
          className="chinese-text"
          style={{ 
            width: '100%', 
            padding: 14, 
            borderRadius: 20, 
            border: '1px solid #D4A373',
            marginBottom: 20,
            resize: 'vertical',
            fontSize: 14
          }}
        />
        <button onClick={handleGenerate} className="btn-primary" disabled={loading} style={{ width: '100%', padding: '12px' }}>
          {loading ? '生成中...' : '✨ 生成建筑'}
        </button>
        {generated && generated.blocks && (
          <div style={{ marginTop: 20, padding: 14, background: '#f0e4d0', borderRadius: 16 }}>
            <p className="chinese-text" style={{ fontSize: 13 }}>✓ 生成完成！共 {generated.blocks.length} 个构件，可在游戏中查看</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildingGenerator;
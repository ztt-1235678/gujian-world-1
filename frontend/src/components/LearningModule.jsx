import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LearningModule = () => {
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/knowledge/articles?page=${currentPage}&limit=6&category=${category}`);
      setArticles(res.data.articles);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error('加载知识失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/knowledge/categories');
      setCategories(res.data);
    } catch (err) {}
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchArticles(); }, [currentPage, category]);

  const recordView = async (articleId, timeSpent = 0) => {
    try {
      await axios.post('/api/progress/record-view', { articleId, timeSpent }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (err) {}
  };

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    recordView(article.id);
  };

  const startTime = Date.now();
  const handleClose = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    if (selectedArticle) recordView(selectedArticle.id, timeSpent);
    setSelectedArticle(null);
  };

  const getDifficultyStars = (level) => {
    return '⭐'.repeat(level);
  };

  return (
    <div className="ink-wash">
      <h2 className="chinese-title" style={{ fontSize: 30, textAlign: 'center', color: '#5C2E0A' }}>📖 古建筑宝典</h2>
      <div className="chinese-divider" />
      
      {/* 分类筛选 */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
        <button
          onClick={() => { setCategory('all'); setCurrentPage(1); }}
          style={{
            padding: '8px 22px',
            background: category === 'all' ? 'linear-gradient(135deg, #8B4513, #5C2E0A)' : 'rgba(139,69,19,0.1)',
            border: 'none',
            borderRadius: 40,
            color: category === 'all' ? 'white' : '#5C2E0A',
            cursor: 'pointer',
            fontFamily: "'Noto Serif SC', serif"
          }}
        >
          全部
        </button>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => { setCategory(c); setCurrentPage(1); }}
            style={{
              padding: '8px 22px',
              background: category === c ? 'linear-gradient(135deg, #8B4513, #5C2E0A)' : 'rgba(139,69,19,0.1)',
              border: 'none',
              borderRadius: 40,
              color: category === c ? 'white' : '#5C2E0A',
              cursor: 'pointer',
              fontFamily: "'Noto Serif SC', serif"
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="loading-bar" style={{ width: '150px', margin: '0 auto 16px' }} />
          <div className="chinese-text" style={{ color: '#8B4513' }}>翻阅古籍...</div>
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
        {articles.map(art => (
          <div 
            key={art.id} 
            onClick={() => handleArticleClick(art)} 
            className="scroll-reveal window-frame"
            style={{ 
              background: 'white', 
              borderRadius: 24, 
              padding: 22, 
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: '1px solid #e0c8a8'
            }}
          >
            <h3 className="chinese-text" style={{ fontSize: 20, color: '#8B4513', fontWeight: 600 }}>{art.title}</h3>
            <p className="chinese-text" style={{ color: '#5C2E0A', marginTop: 10, fontSize: 14, lineHeight: 1.6 }}>
              {art.content.substring(0, 100)}...
            </p>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#B87C4E' }}>{art.category}</span>
              <span style={{ fontSize: 12, color: '#E6B422' }}>{getDifficultyStars(art.difficulty)}</span>
            </div>
            {art.originalText && (
              <div className="seal-stamp" style={{ marginTop: 12, fontSize: 10, display: 'inline-block' }}>
                原典
              </div>
            )}
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 40 }}>
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(p => p-1)} 
            className="btn-secondary"
            style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            〈 上一篇
          </button>
          <span className="chinese-text" style={{ padding: '8px 16px', background: 'rgba(139,69,19,0.08)', borderRadius: 30 }}>
            第 {currentPage} / {totalPages} 卷
          </span>
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(p => p+1)} 
            className="btn-secondary"
            style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            下一篇 〉
          </button>
        </div>
      )}

      {/* 文章详情弹窗 */}
      {selectedArticle && (
        <div 
          style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.85)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            zIndex: 1000,
            backdropFilter: 'blur(8px)'
          }} 
          onClick={handleClose}
        >
          <div 
            className="window-frame ink-wash"
            style={{ 
              background: '#FFF8F0', 
              maxWidth: 650, 
              width: '90%', 
              maxHeight: '85vh', 
              overflow: 'auto', 
              borderRadius: 32, 
              padding: 32 
            }} 
            onClick={e => e.stopPropagation()}
          >
            <h2 className="chinese-title" style={{ fontSize: 26, color: '#8B4513', textAlign: 'center' }}>{selectedArticle.title}</h2>
            <div className="chinese-divider" style={{ margin: '12px auto' }} />
            
            <div className="chinese-text" style={{ margin: '20px 0', lineHeight: 1.9, fontSize: 16 }}>
              {selectedArticle.content}
            </div>
            
            <div style={{ background: '#f0e4d0', padding: 18, borderRadius: 20, marginTop: 16 }}>
              <strong className="chinese-text">📌 更多细节</strong>
              <p className="chinese-text" style={{ marginTop: 8, lineHeight: 1.7 }}>{selectedArticle.details}</p>
            </div>
            
            {selectedArticle.originalText && (
              <div style={{ marginTop: 16, padding: 14, background: '#e8dccc', borderRadius: 16, fontStyle: 'italic' }}>
                <strong className="chinese-text">📜 原典引用</strong>
                <p className="chinese-text" style={{ marginTop: 6 }}>“{selectedArticle.originalText}”</p>
              </div>
            )}
            
            <div className="signature" style={{ marginTop: 24 }}>
              古建智境 · 营造法式
            </div>
            
            <button onClick={handleClose} className="btn-primary" style={{ marginTop: 24, width: '100%' }}>
              阖卷
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningModule;
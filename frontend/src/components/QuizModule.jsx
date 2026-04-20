import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const QuizModule = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/quiz/random?count=5');
      setQuestions(res.data.questions);
      setAnswers({});
      setSubmitted(false);
      setResult(null);
    } catch (err) {
      toast.error('加载题目失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadQuiz(); }, []);

  const handleSelect = (qid, idx) => {
    setAnswers(prev => ({ ...prev, [qid]: idx }));
  };

  const recordMistake = async (quizId, userAnswer, correctAnswer) => {
    try {
      await axios.post('/api/mistake', { quizId, userAnswer, correctAnswer }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (err) {}
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      toast.error('请答完所有题目');
      return;
    }
    const payload = { answers: Object.entries(answers).map(([id, selected]) => ({ id: parseInt(id), selected })) };
    try {
      const res = await axios.post('/api/quiz/submit', payload);
      setResult(res.data);
      setSubmitted(true);
      res.data.results.forEach((r) => {
        if (!r.correct) {
          recordMistake(r.id, answers[r.id], r.correctAnswer);
        }
      });
      if (res.data.score === res.data.total) {
        toast.success('🎉 满分通过！学识渊博！');
      }
    } catch (err) {
      toast.error('提交失败');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div className="loading-bar" style={{ width: '120px', margin: '0 auto 16px' }} />
        <div className="chinese-text">出题中...</div>
      </div>
    );
  }

  return (
    <div className="ink-wash">
      <h2 className="chinese-title" style={{ fontSize: 30, textAlign: 'center', color: '#5C2E0A' }}>📝 知识测验</h2>
      <div className="chinese-divider" />
      
      {!submitted ? (
        <>
          {questions.map((q, idx) => (
            <div key={q.id} className="window-frame" style={{ background: 'white', marginBottom: 20, padding: 22 }}>
              <p className="chinese-text" style={{ fontWeight: 'bold', marginBottom: 14, fontSize: 16 }}>
                {idx+1}. {q.question}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {q.options.map((opt, optIdx) => (
                  <label 
                    key={optIdx} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 12, 
                      cursor: 'pointer',
                      padding: '8px 12px',
                      borderRadius: 40,
                      background: answers[q.id] === optIdx ? 'rgba(139,69,19,0.08)' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                  >
                    <input 
                      type="radio" 
                      name={`q${q.id}`} 
                      onChange={() => handleSelect(q.id, optIdx)} 
                      checked={answers[q.id] === optIdx} 
                      style={{ width: 16, height: 16, accentColor: '#8B4513' }}
                    />
                    <span className="chinese-text">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button onClick={handleSubmit} className="btn-primary" style={{ width: '100%', marginTop: 20, padding: '14px' }}>
            提交答案
          </button>
        </>
      ) : (
        <div>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 48, fontWeight: 'bold', color: result.score === result.total ? '#E6B422' : '#8B4513' }}>
              {result.score} / {result.total}
            </div>
            <div className="chinese-text" style={{ marginTop: 8 }}>
              {result.score === result.total ? '🎉 满分！学识渊博！ 🎉' : '继续努力，精益求精'}
            </div>
          </div>
          
          {result.results.map((r, i) => (
            <div 
              key={i} 
              style={{ 
                background: r.correct ? 'rgba(74,124,89,0.1)' : 'rgba(227,66,52,0.08)', 
                padding: 18, 
                borderRadius: 20, 
                marginBottom: 14,
                borderLeft: `4px solid ${r.correct ? '#4A7C59' : '#E34234'}`
              }}
            >
              <p className="chinese-text" style={{ fontWeight: 'bold' }}>
                题目 {i+1} {r.correct ? '✓ 正确' : '✗ 错误'}
              </p>
              <p className="chinese-text" style={{ marginTop: 6 }}>正确答案：{r.correctAnswer}</p>
              <p className="chinese-text" style={{ marginTop: 6, fontSize: 13, color: '#666' }}>解析：{r.explanation}</p>
            </div>
          ))}
          
          <button onClick={loadQuiz} className="btn-secondary" style={{ width: '100%', marginTop: 16 }}>
            再来一组
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizModule;
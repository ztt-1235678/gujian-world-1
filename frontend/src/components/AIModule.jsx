import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AIModule = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '您好！我是智语，您的古建筑伙伴。可以问我建筑知识、建造技巧，或者聊聊古建文化～' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const context = messages.slice(-4).map(m => ({ role: m.role, content: m.content }));
      const res = await axios.post('/api/ai/chat', { message: input, context });
      const reply = res.data.reply;
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      toast.error('AI暂时无法回答');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '60vh', minHeight: 450 }}>
      <h2 className="chinese-title" style={{ fontSize: 30, textAlign: 'center', color: '#5C2E0A' }}>🤖 智语古建</h2>
      <div className="chinese-divider" />
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        background: 'rgba(255,250,240,0.7)', 
        borderRadius: 28, 
        padding: 24, 
        marginBottom: 20,
        border: '1px solid rgba(212,163,115,0.2)'
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 18 }}>
            <div style={{ 
              maxWidth: '80%', 
              padding: '12px 20px', 
              borderRadius: 24, 
              background: msg.role === 'user' ? 'linear-gradient(135deg, #8B4513, #5C2E0A)' : '#f5e6d3', 
              color: msg.role === 'user' ? 'white' : '#2C1810',
              fontFamily: "'Noto Serif SC', serif",
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ textAlign: 'left' }}>
            <span style={{ background: '#f5e6d3', padding: '10px 20px', borderRadius: 24, display: 'inline-block' }}>
              智语正在思考...
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: 'flex', gap: 14 }}>
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyPress={e => e.key === 'Enter' && sendMessage()} 
          placeholder="向智语提问..." 
          className="chinese-text"
          style={{ 
            flex: 1, 
            padding: '14px 22px', 
            borderRadius: 40, 
            border: '1px solid #D4A373',
            background: 'white',
            fontSize: 15,
            outline: 'none'
          }} 
        />
        <button onClick={sendMessage} className="btn-primary" style={{ padding: '12px 28px' }}>
          发送
        </button>
      </div>
    </div>
  );
};

export default AIModule;
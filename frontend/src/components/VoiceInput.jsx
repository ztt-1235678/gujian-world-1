import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const VoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('浏览器不支持语音识别');
      return;
    }
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = false;
    recognitionInstance.lang = 'zh-CN';
    recognitionInstance.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      setIsListening(false);
      toast.success(`识别: ${text}`);
      try {
        const res = await axios.post('/api/ai/chat', { message: text, context: [] });
        toast.success(`智语回复: ${res.data.reply.slice(0, 40)}...`);
      } catch (err) {
        toast.error('AI回复失败');
      }
    };
    recognitionInstance.onerror = () => {
      setIsListening(false);
      toast.error('语音识别失败');
    };
    recognitionInstance.start();
    setRecognition(recognitionInstance);
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  return (
    <button
      onClick={isListening ? stopListening : startListening}
      className={isListening ? 'btn-primary' : 'btn-secondary tooltip-chinese'}
      data-tip="语音提问AI"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
    >
      🎤 {isListening ? '聆听中...' : '语音提问'}
    </button>
  );
};

export default VoiceInput;
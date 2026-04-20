import { useEffect } from 'react';

const AudioClick = () => {
  useEffect(() => {
    const playClick = () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.value = 0.1;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
        osc.stop(ctx.currentTime + 0.12);
        if (ctx.state === 'suspended') ctx.resume();
      } catch(e) {}
    };
    document.addEventListener('click', playClick);
    return () => document.removeEventListener('click', playClick);
  }, []);
  return null;
};

export default AudioClick;
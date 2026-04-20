const express = require('express');
const router = express.Router();

const quizBank = [
  { id: 1, question: '庑殿顶又称为什么？', options: ['五脊殿', '九脊殿', '悬山顶', '硬山顶'], answer: 0, explanation: '庑殿顶由一条正脊和四条垂脊组成，共五条脊。' },
  { id: 2, question: '斗拱的主要作用是什么？', options: ['装饰', '承重传递', '防火', '采光'], answer: 1, explanation: '斗拱承托屋檐重量并将荷载传递到柱子上。' },
  { id: 3, question: '应县木塔建于哪个朝代？', options: ['唐代', '宋代', '辽代', '金代'], answer: 2, explanation: '应县木塔建于辽代清宁二年（1056年）。' },
  { id: 4, question: '《营造法式》的作者是谁？', options: ['李诫', '喻皓', '蒯祥', '梁思成'], answer: 0, explanation: '《营造法式》是北宋李诫所著。' },
  { id: 5, question: '徽派建筑的马头墙主要功能是什么？', options: ['装饰', '防火', '防盗', '挡风'], answer: 1, explanation: '马头墙又称封火墙，主要用于防火隔断。' },
  { id: 6, question: '“如鸟斯革，如翚斯飞”形容建筑的哪个部分？', options: ['屋顶', '斗拱', '柱子', '门窗'], answer: 0, explanation: '形容飞檐翘角的屋顶。' },
  { id: 7, question: '苏州园林被列入世界文化遗产是哪一年？', options: ['1985', '1997', '2000', '2004'], answer: 1, explanation: '1997年。' },
  { id: 8, question: '下列哪种屋顶等级最高？', options: ['歇山顶', '庑殿顶', '悬山顶', '硬山顶'], answer: 1, explanation: '庑殿顶等级最高。' },
  { id: 9, question: '石狮子雄狮脚下踩的是什么？', options: ['绣球', '幼狮', '铜钱', '宝剑'], answer: 0, explanation: '雄狮踩绣球象征权力。' },
  { id: 10, question: '藻井最初的功能是什么？', options: ['装饰', '防火厌胜', '采光', '通风'], answer: 1, explanation: '藻井有“厌胜”防火的寓意。' },
  { id: 11, question: '闽南建筑屋顶翘起的装饰叫什么？', options: ['马头墙', '镬耳墙', '燕尾脊', '悬鱼'], answer: 2, explanation: '闽南建筑以燕尾脊为特色，形如燕尾。' },
  { id: 12, question: '岭南建筑特有的山墙形式是什么？', options: ['马头墙', '镬耳墙', '燕尾脊', '风火墙'], answer: 1, explanation: '镬耳墙形似锅耳，是岭南建筑特色。' },
  { id: 13, question: '佛光寺东大殿建于哪个朝代？', options: ['唐代', '宋代', '辽代', '金代'], answer: 0, explanation: '佛光寺建于唐大中十一年（857年）。' },
  { id: 14, question: '《园冶》的作者是谁？', options: ['李诫', '计成', '喻皓', '蒯祥'], answer: 1, explanation: '《园冶》是明代计成所著园林专著。' },
  { id: 15, question: '太和殿使用的是什么屋顶形式？', options: ['重檐庑殿顶', '重檐歇山顶', '单檐庑殿顶', '单檐歇山顶'], answer: 0, explanation: '太和殿使用重檐庑殿顶，是最高等级。' }
];

router.get('/random', (req, res) => {
  const count = Math.min(parseInt(req.query.count) || 5, quizBank.length);
  const shuffled = [...quizBank].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);
  const questions = selected.map(q => ({ id: q.id, question: q.question, options: q.options }));
  res.json({ questions });
});

router.post('/submit', (req, res) => {
  const { answers } = req.body;
  const results = answers.map(ans => {
    const q = quizBank.find(q => q.id === ans.id);
    if (!q) return null;
    const isCorrect = (q.answer === ans.selected);
    return { id: q.id, correct: isCorrect, explanation: q.explanation, correctAnswer: q.options[q.answer] };
  });
  const score = results.filter(r => r && r.correct).length;
  res.json({ score, total: answers.length, results });
});

module.exports = router;
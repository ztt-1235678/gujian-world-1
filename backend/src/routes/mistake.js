const express = require('express');
const MistakeRecord = require('../models/MistakeRecord');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const mistakes = await MistakeRecord.findAll({ where: { userId: req.userId }, order: [['createdAt', 'DESC']] });
    res.json({ mistakes });
  } catch (err) {
    res.status(500).json({ error: '获取错题失败' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { quizId, userAnswer, correctAnswer } = req.body;
    await MistakeRecord.create({ userId: req.userId, quizId, userAnswer, correctAnswer });
    res.json({ message: '错题已记录' });
  } catch (err) {
    res.status(500).json({ error: '记录失败' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await MistakeRecord.destroy({ where: { id: req.params.id, userId: req.userId } });
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;
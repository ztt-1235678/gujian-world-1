const express = require('express');
const LearningRecord = require('../models/LearningRecord');
const MistakeRecord = require('../models/MistakeRecord');
const Achievement = require('../models/Achievement');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const viewedCount = await LearningRecord.count({ where: { userId } });
    const mistakeCount = await MistakeRecord.count({ where: { userId } });
    const accuracy = Math.min(100, Math.round((1 - mistakeCount / 20) * 100));
    const achievements = await Achievement.count({ where: { userId } });
    const totalTime = await LearningRecord.sum('timeSpent', { where: { userId } }) || 0;
    res.json({ viewedArticles: viewedCount, mistakeCount, accuracy, totalQuizzes: 15, achievements, totalTime });
  } catch (err) {
    res.status(500).json({ error: '获取进度失败' });
  }
});

router.post('/record-view', auth, async (req, res) => {
  try {
    const { articleId, timeSpent = 0 } = req.body;
    await LearningRecord.create({ userId: req.userId, articleId, timeSpent });
    res.json({ message: '记录成功' });
  } catch (err) {
    res.status(500).json({ error: '记录失败' });
  }
});

module.exports = router;
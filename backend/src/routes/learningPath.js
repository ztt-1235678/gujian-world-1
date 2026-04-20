const express = require('express');
const LearningPath = require('../models/LearningPath');
const LearningRecord = require('../models/LearningRecord');
const auth = require('../middleware/auth');
const router = express.Router();

const stages = [
  { id: 1, name: '初识古建', requiredArticles: 3, description: '了解古建筑基本概念和屋顶样式' },
  { id: 2, name: '结构探秘', requiredArticles: 6, description: '学习斗拱、梁架等核心结构' },
  { id: 3, name: '经典巡礼', requiredArticles: 10, description: '探索著名古建筑和园林' },
  { id: 4, name: '技艺传承', requiredArticles: 15, description: '研读《营造法式》与装饰技艺' },
  { id: 5, name: '营造大师', requiredArticles: 20, description: '全面掌握古建筑知识体系' }
];

router.get('/', auth, async (req, res) => {
  try {
    let path = await LearningPath.findOne({ where: { userId: req.userId } });
    if (!path) path = await LearningPath.create({ userId: req.userId });
    const articlesRead = await LearningRecord.count({ where: { userId: req.userId } });
    let currentStage = stages[0];
    for (let i = stages.length - 1; i >= 0; i--) {
      if (articlesRead >= stages[i].requiredArticles) {
        currentStage = stages[i];
        break;
      }
    }
    const nextStage = stages.find(s => s.id === currentStage.id + 1);
    const progress = Math.min(100, Math.round((articlesRead / (nextStage?.requiredArticles || currentStage.requiredArticles)) * 100));
    res.json({ currentStage, nextStage: nextStage || null, progress, articlesRead });
  } catch (err) {
    res.status(500).json({ error: '获取学习路径失败' });
  }
});

module.exports = router;
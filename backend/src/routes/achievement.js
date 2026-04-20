const express = require('express');
const Achievement = require('../models/Achievement');
const LearningRecord = require('../models/LearningRecord');
const MistakeRecord = require('../models/MistakeRecord');
const auth = require('../middleware/auth');
const router = express.Router();

const achievements = [
  { type: 'scholar', name: '初入学堂', description: '学习5篇文章', icon: '📖' },
  { type: 'scholar2', name: '博古通今', description: '学习15篇文章', icon: '🏛️' },
  { type: 'scholar3', name: '学富五车', description: '学习20篇文章', icon: '📚' },
  { type: 'quiz', name: '初试锋芒', description: '完成一次测验', icon: '📝' },
  { type: 'quiz2', name: '百发百中', description: '测验全对', icon: '🎯' },
  { type: 'builder', name: '能工巧匠', description: '建造100个方块', icon: '🏗️' },
  { type: 'builder2', name: '大匠运斤', description: '建造500个方块', icon: '🏯' },
  { type: 'sharer', name: '乐于分享', description: '分享自己的世界', icon: '🔗' },
  { type: 'ai', name: '智语之友', description: '与AI对话10次', icon: '🤖' },
  { type: 'master', name: '营造大师', description: '建筑评分达到80分', icon: '👑' }
];

router.get('/', auth, async (req, res) => {
  try {
    const userAchievements = await Achievement.findAll({ where: { userId: req.userId } });
    const unlockedTypes = userAchievements.map(a => a.type);
    const articlesRead = await LearningRecord.count({ where: { userId: req.userId } });
    const mistakes = await MistakeRecord.count({ where: { userId: req.userId } });
    const unlockedList = achievements.map(ach => ({
      ...ach,
      unlocked: unlockedTypes.includes(ach.type),
      canUnlock: !unlockedTypes.includes(ach.type) && (
        (ach.type === 'scholar' && articlesRead >= 5) ||
        (ach.type === 'scholar2' && articlesRead >= 15) ||
        (ach.type === 'scholar3' && articlesRead >= 20) ||
        (ach.type === 'quiz' && true) ||
        (ach.type === 'quiz2' && mistakes === 0)
      )
    }));
    res.json({ achievements: unlockedList });
  } catch (err) {
    res.status(500).json({ error: '获取成就失败' });
  }
});

module.exports = router;
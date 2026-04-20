const express = require('express');
const LearningRecord = require('../models/LearningRecord');
const auth = require('../middleware/auth');
const router = express.Router();

const allArticles = [
  { id: 1, title: '庑殿顶——皇家气度', tags: ['屋顶', '皇家'] },
  { id: 2, title: '歇山顶——典雅平衡', tags: ['屋顶', '园林'] },
  { id: 3, title: '斗拱——木构之魂', tags: ['斗拱', '结构'] },
  { id: 4, title: '应县木塔——千年不倒', tags: ['塔', '奇迹'] },
  { id: 5, title: '雀替——梁上华章', tags: ['装饰', '木雕'] },
  { id: 6, title: '《营造法式》——天工开物', tags: ['典籍', '模数'] },
  { id: 7, title: '徽派建筑——粉墙黛瓦', tags: ['民居', '徽派'] },
  { id: 8, title: '闽南建筑——燕尾脊', tags: ['民居', '闽南'] }
];

router.get('/', auth, async (req, res) => {
  try {
    const records = await LearningRecord.findAll({ where: { userId: req.userId }, order: [['viewedAt', 'DESC']] });
    const viewedIds = records.map(r => r.articleId);
    const unviewed = allArticles.filter(a => !viewedIds.includes(a.id));
    if (unviewed.length === 0) {
      return res.json({ recommendations: allArticles.slice(0, 3) });
    }
    const tagCount = {};
    records.forEach(r => {
      const article = allArticles.find(a => a.id === r.articleId);
      if (article) article.tags.forEach(tag => { tagCount[tag] = (tagCount[tag] || 0) + 1; });
    });
    const sortedTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 2).map(v => v[0]);
    let recommended = unviewed.filter(a => a.tags.some(t => sortedTags.includes(t)));
    if (recommended.length < 3) recommended = [...recommended, ...unviewed.filter(a => !recommended.includes(a))];
    res.json({ recommendations: recommended.slice(0, 3) });
  } catch (err) {
    res.status(500).json({ error: '推荐失败' });
  }
});

module.exports = router;
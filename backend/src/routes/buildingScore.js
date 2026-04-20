const express = require('express');
const WorldSave = require('../models/WorldSave');
const router = express.Router();

router.get('/:userId', async (req, res) => {
  try {
    const world = await WorldSave.findOne({ where: { userId: req.params.userId, worldName: '我的古建世界' } });
    res.json({ score: world?.score || 0 });
  } catch (err) {
    res.status(500).json({ error: '获取评分失败' });
  }
});

module.exports = router;
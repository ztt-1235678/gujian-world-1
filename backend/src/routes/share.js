const express = require('express');
const WorldSave = require('../models/WorldSave');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/import', auth, async (req, res) => {
  try {
    const { shareCode } = req.body;
    const shared = await WorldSave.findOne({ where: { shareCode, isPublic: true } });
    if (!shared) return res.status(404).json({ error: '分享码无效' });
    let userWorld = await WorldSave.findOne({ where: { userId: req.userId, worldName: '我的古建世界' } });
    if (userWorld) {
      userWorld.worldData = shared.worldData;
      userWorld.updatedAt = new Date();
      await userWorld.save();
    } else {
      await WorldSave.create({ userId: req.userId, worldData: shared.worldData, worldName: '我的古建世界' });
    }
    res.json({ message: '导入成功' });
  } catch (err) {
    res.status(500).json({ error: '导入失败' });
  }
});

module.exports = router;
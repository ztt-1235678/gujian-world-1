const express = require('express');
const { v4: uuidv4 } = require('uuid');
const WorldSave = require('../models/WorldSave');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/save', auth, async (req, res) => {
  try {
    const { worldData, isPublic = false, score = 0 } = req.body;
    let record = await WorldSave.findOne({ where: { userId: req.userId, worldName: '我的古建世界' } });
    if (!record) {
      record = await WorldSave.create({
        userId: req.userId,
        worldData: JSON.stringify(worldData),
        isPublic,
        shareCode: isPublic ? uuidv4().slice(0, 8) : null,
        score
      });
    } else {
      record.worldData = JSON.stringify(worldData);
      record.isPublic = isPublic;
      if (isPublic && !record.shareCode) record.shareCode = uuidv4().slice(0, 8);
      if (score > record.score) record.score = score;
      record.updatedAt = new Date();
      await record.save();
    }
    res.json({ message: '保存成功', shareCode: record.shareCode, score: record.score });
  } catch (err) {
    res.status(500).json({ error: '保存失败' });
  }
});

router.get('/load', auth, async (req, res) => {
  try {
    const record = await WorldSave.findOne({ where: { userId: req.userId, worldName: '我的古建世界' } });
    res.json({ worldData: record ? JSON.parse(record.worldData) : null, score: record?.score || 0 });
  } catch (err) {
    res.status(500).json({ error: '加载失败' });
  }
});

router.get('/share/:code', async (req, res) => {
  try {
    const record = await WorldSave.findOne({ where: { shareCode: req.params.code, isPublic: true } });
    if (!record) return res.status(404).json({ error: '分享不存在' });
    res.json({ worldData: JSON.parse(record.worldData), owner: record.userId, score: record.score });
  } catch (err) {
    res.status(500).json({ error: '获取分享失败' });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const topBuilds = await WorldSave.findAll({
      where: { isPublic: true },
      order: [['score', 'DESC']],
      limit: 10,
      attributes: ['userId', 'score', 'shareCode']
    });
    res.json({ leaderboard: topBuilds });
  } catch (err) {
    res.status(500).json({ error: '获取排行榜失败' });
  }
});

module.exports = router;
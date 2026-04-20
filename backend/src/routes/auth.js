const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ where: { username } });
    if (existing) return res.status(400).json({ error: '用户名已存在' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });
    const token = jwt.sign({ userId: user.id, username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username, email, theme: user.theme } });
  } catch (err) {
    res.status(500).json({ error: '注册失败' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ error: '用户名或密码错误' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: '用户名或密码错误' });
    const token = jwt.sign({ userId: user.id, username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username, email: user.email, theme: user.theme } });
  } catch (err) {
    res.status(500).json({ error: '登录失败' });
  }
});

router.get('/me', require('../middleware/auth'), async (req, res) => {
  const user = await User.findByPk(req.userId, { attributes: { exclude: ['password'] } });
  res.json(user);
});

router.put('/theme', require('../middleware/auth'), async (req, res) => {
  try {
    const { theme } = req.body;
    await User.update({ theme }, { where: { id: req.userId } });
    res.json({ message: '主题已更新', theme });
  } catch (err) {
    res.status(500).json({ error: '更新失败' });
  }
});

module.exports = router;
const express = require('express');
const axios = require('axios');
const router = express.Router();

const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

router.post('/chat', async (req, res) => {
  try {
    const { message, context = [] } = req.body;
    const messages = [
      { role: 'system', content: '你是古建筑专家“智语”，回答通俗易懂，可结合游戏和学习场景。' },
      ...context,
      { role: 'user', content: message }
    ];
    const response = await axios.post(ZHIPU_API_URL, {
      model: 'glm-4',
      messages,
      temperature: 0.7,
      max_tokens: 800
    }, {
      headers: { Authorization: `Bearer ${process.env.ZHIPU_API_KEY}`, 'Content-Type': 'application/json' }
    });
    res.json({ reply: response.data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: 'AI服务暂时不可用' });
  }
});

router.post('/generate-building', async (req, res) => {
  try {
    const { description } = req.body;
    const prompt = `根据以下描述，生成古建筑结构数据，返回JSON格式：{"blocks":[{"x":0,"y":0,"z":0,"type":"wood"}]}。描述：${description}`;
    const response = await axios.post(ZHIPU_API_URL, {
      model: 'glm-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000
    }, {
      headers: { Authorization: `Bearer ${process.env.ZHIPU_API_KEY}`, 'Content-Type': 'application/json' }
    });
    let buildingData;
    try {
      const jsonMatch = response.data.choices[0].message.content.match(/\{[\s\S]*\}/);
      buildingData = jsonMatch ? JSON.parse(jsonMatch[0]) : { blocks: [] };
    } catch {
      buildingData = { blocks: [] };
    }
    res.json(buildingData);
  } catch (err) {
    res.json({ blocks: [] });
  }
});

module.exports = router;
// ====================== 基础依赖 ======================
const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

// ====================== 加载环境变量 ======================
dotenv.config();

// ====================== 路由 ======================
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const worldRoutes = require('./routes/world');
const knowledgeRoutes = require('./routes/knowledge');
const quizRoutes = require('./routes/quiz');
const progressRoutes = require('./routes/progress');
const mistakeRoutes = require('./routes/mistake');
const recommendRoutes = require('./routes/recommend');
const shareRoutes = require('./routes/share');
const achievementRoutes = require('./routes/achievement');
const learningPathRoutes = require('./routes/learningPath');
const buildingScoreRoutes = require('./routes/buildingScore');

// ====================== 数据库 ======================
const { sequelize } = require('./db');

// 👉 数据库路径（本地 + 部署兼容）
const dbPath = process.env.NODE_ENV === 'production'
  ? '/tmp/database.sqlite'
  : path.join(__dirname, '../data/database.sqlite');

console.log('数据库路径:', dbPath);

// ====================== 创建服务 ======================
const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ====================== 端口 ======================
// 注意：如果你 start.bat 里写的是 5000，这里建议统一改为 5000
const PORT = process.env.PORT || 5000; 

// ====================== 中间件 ======================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ====================== API 路由 ======================
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/world', worldRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/mistake', mistakeRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/achievement', achievementRoutes);
app.use('/api/learning-path', learningPathRoutes);
app.use('/api/building-score', buildingScoreRoutes);

// ====================== 健康检查 ======================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '古建智境后端运行中',
    time: new Date()
  });
});

// ====================== 🚀 方案 B：前端托管逻辑 (新增) ======================

// 1. 指定前端打包后的 dist 目录路径
const distPath = path.join(__dirname, '../../frontend/dist');

// 2. 托管静态资源 (js, css, images)
app.use(express.static(distPath));

// 3. 拦截所有非 API 的 GET 请求，返回前端首页 index.html
// 这样即使在浏览器里输入 http://localhost:5000/login 也能正确跳转
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ====================== Socket 房间 ======================
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, []);
    }

    rooms.get(roomId).push(socket.id);

    socket.to(roomId).emit('user-joined', {
      userId: socket.id
    });
  });

  socket.on('place-block', (data) => {
    socket.to(data.roomId).emit('block-placed', data);
  });

  socket.on('remove-block', (data) => {
    socket.to(data.roomId).emit('block-removed', data);
  });

  socket.on('disconnect', () => {
    rooms.forEach((users, roomId) => {
      const index = users.indexOf(socket.id);
      if (index !== -1) {
        users.splice(index, 1);
      }

      socket.to(roomId).emit('user-left', {
        userId: socket.id
      });
    });

    console.log('用户断开:', socket.id);
  });
});

// ====================== 启动服务 ======================
async function startServer() {
  try {
    await sequelize.sync({ alter: true });

    server.listen(PORT, () => {
      console.log('==============================');
      console.log(`🚀 系统启动成功！`);
      console.log(`📍 浏览器访问: http://localhost:${PORT}`);
      console.log(`📂 托管目录: ${distPath}`);
      console.log('==============================');
    });
  } catch (error) {
    console.error('❌ 启动失败:', error);
  }
}

startServer();
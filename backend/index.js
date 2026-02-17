require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./models');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const port = process.env.PORT || 3001;

// 导入路由
const classesRoutes = require('./routes/classes');
const studentsRoutes = require('./routes/students');
const todosRoutes = require('./routes/todos');
const courseLibraryRoutes = require('./routes/courseLibrary');
const announcementsRoutes = require('./routes/announcements');
const testRoutes = require('./routes/test');
const authRoutes = require('./routes/auth');

app.use(cors({
  origin: true, // 允许所有源
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 使用API路由
app.use('/api/classes', classesRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/todos', todosRoutes);
app.use('/api/course-library', courseLibraryRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', testRoutes);

// 全局错误处理
app.use(errorHandler);

// 启动服务器
const startServer = async () => {
  try {
    // 初始化数据库
    await initDatabase();

    // 启动服务器
    app.listen(port, () => {
      console.log(`服务器已启动，端口：${port}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();
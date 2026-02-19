require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./models');
const errorHandler = require('./middlewares/errorHandler');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const logger = require('./utils/logger');

const app = express();
const port = process.env.PORT || 3001;

// Security Middleware
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Logging Middleware
app.use(morgan('combined', { stream: logger.stream }));

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
      logger.info(`服务器已启动，端口：${port}`);
    });
  } catch (error) {
    logger.error(`服务器启动失败: ${error.message}`);
    process.exit(1);
  }
};

startServer();
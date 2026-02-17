require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;
const OpenAI = require("openai");
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { initDatabase } = require('./models');

// 导入路由
const classesRoutes = require('./routes/classes');
const studentsRoutes = require('./routes/students');
const todosRoutes = require('./routes/todos');
const courseLibraryRoutes = require('./routes/courseLibrary');
const announcementsRoutes = require('./routes/announcements');

app.use(cors({
  origin: true, // 允许所有源
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const basename = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, basename + ext);
  }
});
const upload = multer({ storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 使用API路由
app.use('/api/classes', classesRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/todos', todosRoutes);
app.use('/api/course-library', courseLibraryRoutes);
app.use('/api/announcements', announcementsRoutes);

const openai = new OpenAI({
    apiKey: "sk-dc8a231641d244c8839bcd15dcdd679e", // 请在环境变量中配置API Key
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

// 测试接口
app.get('/api/hello', (req, res) => {
  res.json({ message: '你好，API测试成功！' });
});
// 通义千问-VL接口
app.post('/api/qwen-vl', async (req, res) => {
  const { imageUrl, text } = req.body;
  if (!imageUrl || !text) {
    return res.status(400).json({ error: '缺少 imageUrl 或 text 参数' });
  }
  try {
    const response = await openai.chat.completions.create({
      model: "qwen-vl-max",
      messages: [
        { role: "user", content: [
          { type: "image_url", image_url: { url: imageUrl } },
          { type: "text", text: text }
        ]}
      ]
    });
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message || 'API请求失败' });
  }
});

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
  }
};

startServer(); 
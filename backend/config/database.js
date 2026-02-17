const { Sequelize } = require('sequelize');

// 创建MySQL数据库连接
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'zj_classroom',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  logging: false, // 设置为 true 可以看到SQL查询日志
  pool: {
    max: 10, // 最大连接数
    min: 0,  // 最小连接数
    acquire: 30000, // 获取连接的最大时间
    idle: 10000 // 连接空闲的最大时间
  },
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    timestamps: true, // 自动添加 createdAt 和 updatedAt
    underscored: false // 使用驼峰命名
  }
});

module.exports = sequelize;

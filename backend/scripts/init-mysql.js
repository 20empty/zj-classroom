const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
  try {
    console.log('正在连接MySQL服务器...');
    console.log('配置信息:', {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD ? '***' : '(空)'
    });
    
    // 连接到MySQL服务器（不指定数据库）
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      connectTimeout: 10000
    });

    // 创建数据库
    const dbName = process.env.DB_NAME || 'zj_classroom';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    console.log(`✅ 数据库 ${dbName} 创建成功`);
    
    await connection.end();
  } catch (error) {
    console.error('❌ 创建数据库失败:', error.message);
    process.exit(1);
  }
}

createDatabase();

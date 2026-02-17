# MySQL数据库部署指南

## 📋 前置要求

### 1. 安装MySQL
```bash
# macOS (使用Homebrew)
brew install mysql

# 启动MySQL服务
brew services start mysql

# 或者手动启动
mysql.server start
```

### 2. 配置MySQL
```bash
# 运行安全配置脚本
mysql_secure_installation

# 登录MySQL
mysql -u root -p
```

## 🚀 部署步骤

### 1. 创建数据库
```bash
# 进入后端目录
cd /Users/jerry/zj-classroom/backend

# 运行数据库初始化脚本
npm run init-db
```

### 2. 配置环境变量
创建 `.env` 文件：
```env
# MySQL数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=zj_classroom
DB_USER=root
DB_PASSWORD=your_password_here

# 服务器配置
PORT=3001
NODE_ENV=development
```

### 3. 启动应用
```bash
# 启动后端服务器
npm start
```

## 🔧 数据库配置说明

### 连接池配置
- **最大连接数**: 10
- **最小连接数**: 0
- **获取连接超时**: 30秒
- **连接空闲超时**: 10秒

### 字符集配置
- **字符集**: utf8mb4
- **排序规则**: utf8mb4_unicode_ci
- **支持**: 完整的Unicode字符（包括emoji）

## 🧪 测试连接

### 1. 测试数据库连接
```bash
# 测试API
curl http://localhost:3001/api/hello
```

### 2. 测试数据库操作
```bash
# 创建班级
curl -X POST http://localhost:3001/api/classes \
  -H "Content-Type: application/json" \
  -d '{"name": "测试班级", "teacher": "测试老师"}'
```

## 🔍 故障排除

### 1. 连接被拒绝
```bash
# 检查MySQL是否运行
brew services list | grep mysql

# 重启MySQL
brew services restart mysql
```

### 2. 认证失败
```bash
# 重置root密码
mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
```

### 3. 数据库不存在
```bash
# 手动创建数据库
mysql -u root -p
CREATE DATABASE zj_classroom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 📊 性能优势

### 相比SQLite的优势：
1. **真正的并发支持** - 多用户同时读写
2. **更好的性能** - 优化的查询引擎
3. **连接池管理** - 自动管理数据库连接
4. **事务支持** - 完整的事务处理
5. **扩展性** - 支持分布式部署

### 并发测试：
```bash
# 同时创建多个班级（测试并发）
for i in {1..5}; do
  curl -X POST http://localhost:3001/api/classes \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"并发测试班级$i\", \"teacher\": \"测试老师$i\"}" &
done
wait
```

## 🔒 安全建议

1. **使用强密码**
2. **限制网络访问**
3. **定期备份数据**
4. **监控连接数**
5. **使用SSL连接**（生产环境）

---

*部署完成后，您的应用将支持真正的多用户并发访问！* 🎉

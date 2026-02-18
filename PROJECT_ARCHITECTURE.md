# 浙华Classroom 项目架构文档

## 项目概述

浙华Classroom 是一个现代化的班级管理平台，旨在提供高效的班级、课程、学生及待办事项管理功能。
项目采用前后端分离架构，后端基于 Node.js/Express，前端基于 Vue 3，数据存储采用 **MySQL** 数据库，确保了数据的高可靠性和高并发处理能力。

## 技术栈

### 后端
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL 5.7/8.0
- **ORM**: Sequelize (支持 MySQL 方言)
- **Authentication**: JWT (JSON Web Tokens)
- **Object Storage**: 阿里云 OSS (可选，用于文件上传)

### 前端
- **Framework**: Vue 3 (Composition API)
- **State Management**: Pinia
- **Routing**: Vue Router
- **UI Styling**: CSS3 Variables, Glassmorphism Design
- **HTTP Client**: Native Fetch API (封装于 `request.js`)

## 项目结构


## 项目结构

```
zj-classroom/
├── backend/                    # 后端服务
│   ├── config/
│   │   └── database.js         # 数据库配置
│   ├── models/                 # 数据模型
│   │   ├── index.js           # 模型关联和初始化
│   │   ├── Class.js           # 班级模型
│   │   ├── Student.js         # 学生模型
│   │   ├── Course.js          # 课程模型
│   │   ├── Todo.js            # 待办事项模型
│   │   └── CourseLibrary.js   # 课程库模型
│   ├── routes/                # API路由
│   │   ├── classes.js         # 班级API
│   │   ├── students.js        # 学生API
│   │   ├── courses.js         # 课程API
│   │   ├── todos.js           # 待办事项API
│   │   └── courseLibrary.js   # 课程库API
│   ├── index.js               # 服务器入口
│   ├── package.json           # 依赖配置
│   └── database.sqlite        # SQLite数据库文件
└── web/                       # 前端应用
    ├── src/
    │   ├── stores/            # Pinia状态管理
    │   │   ├── classStore.js  # 班级状态管理
    │   │   └── leaderboardStore.js # 排行榜状态管理
    │   ├── views/             # 页面组件
    │   ├── components/        # 通用组件
    │   └── router.js          # 路由配置
    └── package.json           # 前端依赖配置
```

## 数据库设计

### 数据表结构

#### 1. users (用户表)
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | 用户ID |
| username | STRING | NOT NULL, UNIQUE | 用户名 |
| email | STRING | NOT NULL, UNIQUE | 邮箱 |
| password_hash | STRING | NOT NULL | 密码哈希 |
| role | ENUM | DEFAULT 'student' | 角色 |
| createdAt | DATETIME | | 创建时间 |
| updatedAt | DATETIME | | 更新时间 |

#### 2. classes (班级表)
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | 班级ID |
| name | STRING | NOT NULL | 班级名称 |
| teacher | STRING | | 讲师 |
| image | STRING | | 班级图片 |
| contractNumber | STRING | | 合同号 |
| classId | STRING | | 班号 |
| location | STRING | | 交付地 |
| date | STRING | | 培训时间 |
| customer | STRING | | 培训对象 |
| coordinator | STRING | | 班主任 |
| createdAt | DATETIME | | 创建时间 |
| updatedAt | DATETIME | | 更新时间 |

#### 2. students (学生表)
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | 学生ID |
| classId | INTEGER | NOT NULL, FOREIGN KEY | 所属班级ID |
| name | STRING | NOT NULL | 学生姓名 |
| points | INTEGER | DEFAULT 0 | 积分 |
| records | JSON | DEFAULT [] | 积分记录 |
| createdAt | DATETIME | | 创建时间 |
| updatedAt | DATETIME | | 更新时间 |

#### 3. courses (课程表)
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | 课程ID |
| classId | INTEGER | NOT NULL, FOREIGN KEY | 所属班级ID |
| title | STRING | NOT NULL | 课程标题 |
| duration | STRING | | 课程时长 |
| content | TEXT | | 课程内容 |
| type | STRING | | 课程类型 |
| courseLibraryId | INTEGER | | 课程库ID |
| createdAt | DATETIME | | 创建时间 |
| updatedAt | DATETIME | | 更新时间 |

#### 4. todos (待办事项表)
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | 待办ID |
| classId | INTEGER | NOT NULL, FOREIGN KEY | 所属班级ID |
| text | STRING | NOT NULL | 待办内容 |
| status | ENUM | DEFAULT 'planning' | 状态(planning/doing/done) |
| date | STRING | | 日期 |
| createdAt | DATETIME | | 创建时间 |
| updatedAt | DATETIME | | 更新时间 |

#### 5. course_library (课程库表)
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | 课程库ID |
| name | STRING | NOT NULL | 课程名称 |
| description | TEXT | | 课程描述 |
| duration | STRING | | 课程时长 |
| category | STRING | | 课程分类 |
| createdAt | DATETIME | | 创建时间 |
| updatedAt | DATETIME | | 更新时间 |

### 表关系
- `users` 1:N `classes` (一个用户创建多个班级)
- `classes` 1:N `students` (一个班级有多个学生)
- `classes` 1:N `courses` (一个班级有多个课程)
- `classes` 1:N `todos` (一个班级有多个待办事项)
- `course_library` 1:N `courses` (课程库课程可被多个班级使用)


(See `API_DOCUMENTATION.md` for detailed API specifications)

### 基础URL
```
http://localhost:3001/api
```

### 班级管理 API

#### 获取所有班级
```http
GET /classes
```
**响应示例:**
```json
[
  {
    "id": 1,
    "name": "华为云HCS培训示范班级",
    "teacher": "李老师",
    "image": "/img/orange-logo.png",
    "contractNumber": "HT2024-001",
    "classId": "HCS-2024-001",
    "location": "杭州华为培训中心",
    "date": "2024-01-15",
    "customer": "华为技术有限公司",
    "coordinator": "张老师",
    "createdAt": "2025-09-19T13:00:24.915Z",
    "updatedAt": "2025-09-19T13:00:24.915Z",
    "students": [],
    "courses": [...],
    "todos": [...]
  }
]
```

#### 创建班级
```http
POST /classes
Content-Type: application/json

{
  "name": "新班级",
  "teacher": "新老师",
  "image": "",
  "contractNumber": "",
  "classId": "",
  "location": "",
  "date": "",
  "customer": "",
  "coordinator": ""
}
```

#### 更新班级
```http
PUT /classes/:id
Content-Type: application/json

{
  "name": "更新后的班级名"
}
```

#### 删除班级
```http
DELETE /classes/:id
```

### 学生管理 API

#### 获取班级学生
```http
GET /students/class/:classId
```

#### 创建学生
```http
POST /students
Content-Type: application/json

{
  "classId": 1,
  "name": "张三",
  "points": 0,
  "records": []
}
```

#### 给学生加分
```http
POST /students/:id/add-points
Content-Type: application/json

{
  "points": 10,
  "description": "课堂表现优秀"
}
```

### 课程管理 API

#### 获取班级课程
```http
GET /courses/class/:classId
```

#### 创建课程
```http
POST /courses
Content-Type: application/json

{
  "classId": 1,
  "title": "Vue.js基础",
  "duration": "2",
  "content": "Vue.js基础语法和组件开发",
  "type": "自定义课程"
}
```

### 待办事项 API

#### 获取班级待办事项
```http
GET /todos/class/:classId
```

#### 创建待办事项
```http
POST /todos
Content-Type: application/json

{
  "classId": 1,
  "text": "准备课程材料",
  "status": "planning",
  "date": "2024-01-15"
}
```

### 课程库 API

#### 获取所有课程库课程
```http
GET /course-library
```

#### 创建课程库课程
```http
POST /course-library
Content-Type: application/json

{
  "name": "华为云HCS架构设计",
  "description": "深入理解华为云HCS整体架构设计",
  "duration": "16",
  "category": "华为云"
}
```

## 前端改造

### Store层改造

#### classStore.js 改造要点
1. **移除localStorage依赖**: 删除所有`localStorage`相关代码
2. **添加API调用**: 实现`fetchClasses()`、`saveToAPI()`等方法
3. **异步处理**: 所有数据操作改为异步函数
4. **错误处理**: 添加统一的错误处理机制

**改造前:**
```javascript
// 从localStorage获取数据
const classes = ref(JSON.parse(localStorage.getItem('classes')) || [])

// 保存到localStorage
const saveToLocalStorage = () => {
  localStorage.setItem('classes', JSON.stringify(classes.value))
}
```

**改造后:**
```javascript
// 从API获取数据
const fetchClasses = async () => {
  try {
    loading.value = true
    const response = await fetch(`${API_BASE_URL}/classes`)
    classes.value = await response.json()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// 保存到API
const saveToAPI = async (method, url, data = null) => {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : null
  })
  return await response.json()
}
```

#### leaderboardStore.js 改造要点
1. **API集成**: 所有学生相关操作改为API调用
2. **状态管理**: 添加loading和error状态
3. **数据同步**: 确保前后端数据一致性

### 组件层改造

#### Home.vue 改造
1. **初始化逻辑**: 组件挂载时调用API获取数据
2. **错误处理**: 添加API调用失败的错误提示
3. **加载状态**: 显示数据加载状态

**改造前:**
```javascript
onMounted(() => {
  classStore.initializeSampleData()
})
```

**改造后:**
```javascript
onMounted(async () => {
  await classStore.initializeSampleData()
})
```

## 部署说明

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装步骤

#### 1. 安装后端依赖
```bash
cd backend
npm install
```

#### 2. 安装前端依赖
```bash
cd web
npm install
```

#### 3. 启动后端服务
```bash
cd backend
node index.js
```
服务将在 http://localhost:3001 启动

#### 4. 启动前端服务
```bash
cd web
npm run serve
```
服务将在 http://localhost:8080 启动

### 数据库初始化
数据库会在后端服务启动时自动创建和初始化，包括：
- 创建所有数据表
- 插入示例数据
- 建立表关联关系

## 测试验证

### 功能测试
1. **班级管理**: 创建、查看、编辑、删除班级
2. **学生管理**: 添加学生、积分管理、排行榜
3. **课程管理**: 课程创建、编辑、删除
4. **待办事项**: 待办创建、状态更新、删除
5. **课程库**: 课程库管理功能

### API测试
使用curl命令测试API接口：
```bash
# 测试获取班级
curl http://localhost:3001/api/classes

# 测试创建班级
curl -X POST http://localhost:3001/api/classes \
  -H "Content-Type: application/json" \
  -d '{"name":"测试班级","teacher":"测试老师"}'
```

### 前端测试
1. 访问 http://localhost:8080
2. 点击"简单测试"按钮测试API调用
3. 验证数据在页面刷新后仍然存在
4. 测试所有CRUD操作

## 性能优化

### 数据库优化
1. **索引优化**: 为常用查询字段添加索引
2. **查询优化**: 使用关联查询减少数据库访问次数
3. **分页查询**: 大数据量时实现分页功能

### 前端优化
1. **缓存策略**: 实现数据缓存减少API调用
2. **懒加载**: 按需加载数据
3. **错误重试**: 实现API调用失败重试机制

## 安全考虑

### 数据安全
1. **输入验证**: 前后端都进行数据验证
2. **SQL注入防护**: 使用Sequelize ORM防止SQL注入
3. **数据备份**: 定期备份SQLite数据库文件

### 访问控制
1. **CORS配置**: 正确配置跨域访问
2. **API限流**: 实现API调用频率限制
3. **错误处理**: 避免敏感信息泄露

## 扩展计划

### 短期扩展
1. **用户认证**: 添加用户登录和权限管理
2. **数据导出**: 支持Excel/PDF格式数据导出
3. **实时通知**: WebSocket实现实时消息推送

### 长期扩展
1. **微服务架构**: 拆分为多个微服务
2. **云数据库**: 迁移到PostgreSQL或MySQL
3. **容器化部署**: Docker容器化部署
4. **监控告警**: 添加系统监控和告警

## 常见问题

### Q1: 数据库文件位置
A: SQLite数据库文件位于 `backend/database.sqlite`

### Q2: 如何备份数据
A: 直接复制 `database.sqlite` 文件即可

### Q3: 如何重置数据
A: 删除 `database.sqlite` 文件，重启后端服务

### Q4: 端口冲突问题
A: 修改 `backend/index.js` 中的端口号，或杀掉占用端口的进程

### Q5: CORS错误
A: 检查后端CORS配置，确保允许前端域名访问

## 总结

本次数据库改造项目成功将浙华Classroom平台从localStorage存储升级为SQLite数据库存储，主要成果包括：

1. **数据持久化**: 数据不再依赖浏览器缓存，实现真正的数据持久化
2. **架构升级**: 从单页应用升级为前后端分离架构
3. **功能完整**: 保持了所有原有功能，并提升了系统稳定性
4. **易于扩展**: 为后续功能扩展奠定了良好基础
5. **部署简单**: 数据库文件随项目一起部署，无需额外配置

项目改造完成后，系统具备了更好的可维护性、可扩展性和稳定性，为后续的功能开发和系统优化提供了坚实的基础。

---

**文档版本**: v1.0  
**最后更新**: 2025-09-19  
**维护人员**: 开发团队

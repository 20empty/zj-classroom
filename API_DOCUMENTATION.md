# 浙华Classroom API 接口文档

## 概述

本文档描述了智慧课堂系统的后端API接口，基于Express.js和 **MySQL** 数据库构建。系统提供用户认证、班级管理、学生管理、课程管理、待办事项管理和课程库管理等功能。

**基础信息：**
- 服务器地址：`http://localhost:3001`
- 数据格式：JSON
- 字符编码：UTF-8
- **认证方式**: Bearer Token (JWT)

## 通用响应格式

### 成功响应
```json
{
  "data": "响应数据",
  "message": "操作成功"
}
```

### 错误响应
```json
{
  "error": "错误信息"
}
```

### HTTP状态码
- `200` - 成功
- `201` - 创建成功
- `400` - 请求参数错误
- `404` - 资源不存在
- `500` - 服务器内部错误

---

## 1. 系统接口

### 1.1 健康检查
**接口地址：** `GET /api/hello`

**功能描述：** 检查API服务是否正常运行

**请求参数：** 无

**响应示例：**
```json
{
  "message": "你好，API测试成功！"
}
```

### 1.2 通义千问视觉接口
**接口地址：** `POST /api/qwen-vl`

**功能描述：** 调用通义千问视觉模型进行图像分析

**请求参数：**
```json
{
  "imageUrl": "图片URL地址",
  "text": "分析提示文本"
}
```

**响应示例：**
```json
{
  "choices": [
    {
      "message": {
        "content": "分析结果"
      }
    }
  ]
}
```

## 2. 用户认证接口

### 2.1 用户注册
**接口地址：** `POST /api/auth/register`

**功能描述：** 注册新用户

**请求参数：**
```json
{
  "username": "用户名",
  "email": "邮箱",
  "password": "密码"
}
```

**响应示例：**
```json
{
  "message": "User registered successfully",
  "userId": 1
}
```

### 2.2 用户登录
**接口地址：** `POST /api/auth/login`

**功能描述：**以此获取访问令牌 (Token)

**请求参数：**
```json
{
  "email": "邮箱",
  "password": "密码"
}
```

**响应示例：**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "student"
  }
}
```

### 2.3 获取当前用户信息
**接口地址：** `GET /api/auth/me`

**请求头：** `Authorization: Bearer <token>`

**响应示例：**
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "role": "student"
}
```

---

## 2. 班级管理接口

### 2.1 获取所有班级
**接口地址：** `GET /api/classes`

**功能描述：** 获取所有班级信息，包含关联的学生、课程和待办事项

**请求参数：** 无

**响应示例：**
```json
[
  {
    "id": 1,
    "name": "华为云HCS培训示范班级",
    "teacher": "李老师",
    "image": "",
    "contractNumber": "HT2024-001",
    "classId": "HT2024-001",
    "location": "上海",
    "date": "2024-12-01",
    "customer": "华为云",
    "coordinator": "张老师",
    "createdAt": "2024-09-19T10:00:00.000Z",
    "updatedAt": "2024-09-19T10:00:00.000Z",
    "students": [
      {
        "id": 1,
        "name": "张三",
        "points": 100,
        "records": [],
        "classId": 1
      }
    ],
    "courses": [
      {
        "id": 1,
        "title": "华为云基础课程",
        "duration": "2小时",
        "content": "课程内容",
        "type": "理论",
        "classId": 1
      }
    ],
    "todos": [
      {
        "id": 1,
        "text": "准备课程材料",
        "status": "pending",
        "date": "2024-12-01",
        "classId": 1
      }
    ]
  }
]
```

### 2.2 获取单个班级
**接口地址：** `GET /api/classes/:id`

**功能描述：** 根据ID获取指定班级的详细信息

**路径参数：**
- `id` (number) - 班级ID

**响应示例：** 同获取所有班级的单个班级对象

### 2.3 创建班级
**接口地址：** `POST /api/classes`

**功能描述：** 创建新的班级

**请求参数：**
```json
{
  "name": "班级名称",
  "teacher": "讲师姓名",
  "image": "班级图片URL",
  "contractNumber": "合同号",
  "classId": "班号",
  "location": "交付地",
  "date": "培训时间",
  "customer": "培训对象",
  "coordinator": "班主任"
}
```

**响应示例：**
```json
{
  "id": 2,
  "name": "新班级",
  "teacher": "新老师",
  "image": "",
  "contractNumber": "",
  "classId": "",
  "location": "",
  "date": "",
  "customer": "",
  "coordinator": "",
  "createdAt": "2024-09-19T10:00:00.000Z",
  "updatedAt": "2024-09-19T10:00:00.000Z"
}
```

### 2.4 更新班级
**接口地址：** `PUT /api/classes/:id`

**功能描述：** 更新指定班级的信息

**路径参数：**
- `id` (number) - 班级ID

**请求参数：** 同创建班级的参数（所有字段可选）

**响应示例：** 同创建班级的响应

### 2.5 删除班级
**接口地址：** `DELETE /api/classes/:id`

**功能描述：** 删除指定的班级

**路径参数：**
- `id` (number) - 班级ID

**响应示例：**
```json
{
  "message": "班级删除成功"
}
```

---

## 3. 学生管理接口

### 3.1 获取班级学生
**接口地址：** `GET /api/students/class/:classId`

**功能描述：** 获取指定班级的所有学生，按积分降序排列

**路径参数：**
- `classId` (number) - 班级ID

**响应示例：**
```json
[
  {
    "id": 1,
    "name": "张三",
    "points": 100,
    "records": [
      {
        "date": "2024-09-19 10:00:00",
        "points": 10,
        "description": "课堂表现优秀"
      }
    ],
    "classId": 1,
    "createdAt": "2024-09-19T10:00:00.000Z",
    "updatedAt": "2024-09-19T10:00:00.000Z"
  }
]
```

### 3.2 创建学生
**接口地址：** `POST /api/students`

**功能描述：** 创建新学生

**请求参数：**
```json
{
  "name": "学生姓名",
  "points": 0,
  "records": [],
  "classId": 1
}
```

**响应示例：**
```json
{
  "id": 2,
  "name": "李四",
  "points": 0,
  "records": [],
  "classId": 1,
  "createdAt": "2024-09-19T10:00:00.000Z",
  "updatedAt": "2024-09-19T10:00:00.000Z"
}
```

### 3.3 更新学生
**接口地址：** `PUT /api/students/:id`

**功能描述：** 更新学生信息

**路径参数：**
- `id` (number) - 学生ID

**请求参数：** 同创建学生的参数（所有字段可选）

**响应示例：** 同创建学生的响应

### 3.4 删除学生
**接口地址：** `DELETE /api/students/:id`

**功能描述：** 删除指定学生

**路径参数：**
- `id` (number) - 学生ID

**响应示例：**
```json
{
  "message": "学生删除成功"
}
```

### 3.5 学生加分
**接口地址：** `POST /api/students/:id/add-points`

**功能描述：** 给学生添加积分并记录

**路径参数：**
- `id` (number) - 学生ID

**请求参数：**
```json
{
  "points": 10,
  "description": "课堂表现优秀"
}
```

**响应示例：** 同创建学生的响应（包含更新后的积分和记录）

---

## 4. 课程管理接口

### 4.1 获取班级课程
**接口地址：** `GET /api/courses/class/:classId`

**功能描述：** 获取指定班级的所有课程

**路径参数：**
- `classId` (number) - 班级ID

**响应示例：**
```json
[
  {
    "id": 1,
    "title": "华为云基础课程",
    "duration": "2小时",
    "content": "课程内容描述",
    "type": "理论",
    "courseLibraryId": 1,
    "classId": 1,
    "createdAt": "2024-09-19T10:00:00.000Z",
    "updatedAt": "2024-09-19T10:00:00.000Z"
  }
]
```

### 4.2 创建课程
**接口地址：** `POST /api/courses`

**功能描述：** 创建新课程

**请求参数：**
```json
{
  "title": "课程标题",
  "duration": "课程时长",
  "content": "课程内容",
  "type": "课程类型",
  "courseLibraryId": 1,
  "classId": 1
}
```

**响应示例：** 同获取班级课程的单个课程对象

### 4.3 更新课程
**接口地址：** `PUT /api/courses/:id`

**功能描述：** 更新课程信息

**路径参数：**
- `id` (number) - 课程ID

**请求参数：** 同创建课程的参数（所有字段可选）

**响应示例：** 同创建课程的响应

### 4.4 删除课程
**接口地址：** `DELETE /api/courses/:id`

**功能描述：** 删除指定课程

**路径参数：**
- `id` (number) - 课程ID

**响应示例：**
```json
{
  "message": "课程删除成功"
}
```

---

## 5. 待办事项管理接口

### 5.1 获取班级待办事项
**接口地址：** `GET /api/todos/class/:classId`

**功能描述：** 获取指定班级的所有待办事项，按日期升序排列

**路径参数：**
- `classId` (number) - 班级ID

**响应示例：**
```json
[
  {
    "id": 1,
    "text": "准备课程材料",
    "status": "pending",
    "date": "2024-12-01",
    "classId": 1,
    "createdAt": "2024-09-19T10:00:00.000Z",
    "updatedAt": "2024-09-19T10:00:00.000Z"
  }
]
```

### 5.2 创建待办事项
**接口地址：** `POST /api/todos`

**功能描述：** 创建新待办事项

**请求参数：**
```json
{
  "text": "待办事项内容",
  "status": "pending",
  "date": "2024-12-01",
  "classId": 1
}
```

**响应示例：** 同获取班级待办事项的单个待办对象

### 5.3 更新待办事项
**接口地址：** `PUT /api/todos/:id`

**功能描述：** 更新待办事项信息

**路径参数：**
- `id` (number) - 待办事项ID

**请求参数：** 同创建待办事项的参数（所有字段可选）

**响应示例：** 同创建待办事项的响应

### 5.4 删除待办事项
**接口地址：** `DELETE /api/todos/:id`

**功能描述：** 删除指定待办事项

**路径参数：**
- `id` (number) - 待办事项ID

**响应示例：**
```json
{
  "message": "待办事项删除成功"
}
```

---

## 6. 课程库管理接口

### 6.1 获取所有课程库课程
**接口地址：** `GET /api/course-library`

**功能描述：** 获取所有课程库课程，按名称升序排列

**请求参数：** 无

**响应示例：**
```json
[
  {
    "id": 1,
    "name": "华为云基础课程",
    "description": "课程描述",
    "duration": "2小时",
    "category": "云计算",
    "type": "理论",
    "createdAt": "2024-09-19T10:00:00.000Z",
    "updatedAt": "2024-09-19T10:00:00.000Z"
  }
]
```

### 6.2 获取单个课程库课程
**接口地址：** `GET /api/course-library/:id`

**功能描述：** 根据ID获取指定课程库课程

**路径参数：**
- `id` (number) - 课程ID

**响应示例：** 同获取所有课程库课程的单个课程对象

### 6.3 创建课程库课程
**接口地址：** `POST /api/course-library`

**功能描述：** 创建新课程库课程

**请求参数：**
```json
{
  "name": "课程名称",
  "description": "课程描述",
  "duration": "课程时长",
  "category": "课程分类",
  "type": "课程类型"
}
```

**响应示例：** 同获取所有课程库课程的单个课程对象

### 6.4 更新课程库课程
**接口地址：** `PUT /api/course-library/:id`

**功能描述：** 更新课程库课程信息

**路径参数：**
- `id` (number) - 课程ID

**请求参数：** 同创建课程库课程的参数（所有字段可选）

**响应示例：** 同创建课程库课程的响应

### 6.5 删除课程库课程
**接口地址：** `DELETE /api/course-library/:id`

**功能描述：** 删除指定课程库课程

**路径参数：**
- `id` (number) - 课程ID

**响应示例：**
```json
{
  "message": "课程删除成功"
}
```

---

## 7. 数据模型说明

### 7.1 用户模型 (User)
| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| id | INTEGER | 主键，自增 | 是 |
| username | STRING | 用户名 | 是 |
| email | STRING | 邮箱 (Unique) | 是 |
| password_hash | STRING | 密码哈希 | 是 |
| role | ENUM | 角色 (student/teacher/admin) | 是 |

### 7.2 班级模型 (Class)
| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| id | INTEGER | 主键，自增 | 是 |
| name | STRING | 班级名称 | 是 |
| teacher | STRING | 讲师 | 否 |
| image | STRING | 班级图片 | 否 |
| contractNumber | STRING | 合同号 | 否 |
| classId | STRING | 班号 | 否 |
| location | STRING | 交付地 | 否 |
| date | STRING | 培训时间 | 否 |
| customer | STRING | 培训对象 | 否 |
| coordinator | STRING | 班主任 | 否 |
| userId | INTEGER | 创建者ID (外键) | 否 |

### 7.2 学生模型 (Student)
| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| id | INTEGER | 主键，自增 | 是 |
| name | STRING | 学生姓名 | 是 |
| points | INTEGER | 积分 | 否 |
| records | JSON | 积分记录 | 否 |
| classId | INTEGER | 班级ID（外键） | 是 |

### 7.3 课程模型 (Course)
| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| id | INTEGER | 主键，自增 | 是 |
| title | STRING | 课程标题 | 是 |
| duration | STRING | 课程时长 | 否 |
| content | TEXT | 课程内容 | 否 |
| type | STRING | 课程类型 | 否 |
| courseLibraryId | INTEGER | 课程库ID | 否 |
| classId | INTEGER | 班级ID（外键） | 是 |

### 7.4 待办事项模型 (Todo)
| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| id | INTEGER | 主键，自增 | 是 |
| text | STRING | 待办内容 | 是 |
| status | STRING | 状态 | 否 |
| date | STRING | 日期 | 否 |
| classId | INTEGER | 班级ID（外键） | 是 |

### 7.5 课程库模型 (CourseLibrary)
| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| id | INTEGER | 主键，自增 | 是 |
| name | STRING | 课程名称 | 是 |
| description | TEXT | 课程描述 | 否 |
| duration | STRING | 课程时长 | 否 |
| category | STRING | 课程分类 | 否 |
| type | STRING | 课程类型 | 否 |

---

## 8. 错误处理

### 8.1 常见错误码
- `400` - 请求参数错误
- `404` - 资源不存在
- `500` - 服务器内部错误

### 8.2 错误响应格式
```json
{
  "error": "具体错误信息"
}
```

### 8.3 常见错误示例
```json
{
  "error": "班级不存在"
}
```

```json
{
  "error": "学生不存在"
}
```

```json
{
  "error": "SQLITE_BUSY: database is locked"
}
```

---

## 9. 使用示例

### 9.1 创建完整班级流程
```bash
# 1. 创建班级
curl -X POST http://localhost:3001/api/classes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试班级",
    "teacher": "测试老师",
    "contractNumber": "TEST-001"
  }'

# 2. 添加学生
curl -X POST http://localhost:3001/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "classId": 1
  }'

# 3. 添加课程
curl -X POST http://localhost:3001/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试课程",
    "duration": "1小时",
    "classId": 1
  }'

# 4. 添加待办事项
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "text": "准备课程材料",
    "status": "pending",
    "classId": 1
  }'
```

### 9.2 获取完整班级信息
```bash
curl http://localhost:3001/api/classes/1
```

---

## 10. 注意事项

1. **数据库连接**：系统使用SQLite数据库，数据库文件位于 `backend/database.sqlite`
2. **CORS配置**：已配置允许跨域请求
3. **文件上传**：支持文件上传，上传目录为 `backend/uploads`
4. **数据关联**：删除班级时会级联删除相关的学生、课程和待办事项
5. **积分记录**：学生积分记录以JSON数组形式存储
6. **日期格式**：建议使用 `YYYY-MM-DD` 格式
7. **API版本**：当前版本为 v1.0

---

## 11. 更新日志

### v1.0.0 (2024-09-19)
- 初始版本发布
- 实现班级、学生、课程、待办事项、课程库的完整CRUD操作
- 集成通义千问视觉API
- 支持SQLite数据库存储
- 实现数据关联和级联操作

---

*本文档最后更新时间：2024年9月19日*

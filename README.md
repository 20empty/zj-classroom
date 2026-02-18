# 浙华 Classroom

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-v18%2B-green.svg)
![MySQL](https://img.shields.io/badge/mysql-v5.7%2B-orange.svg)

浙华 Classroom 是一个现代化的班级管理平台，旨在提供高效的教学管理体验。

## 📚 文档索引

- **[部署指南 (DEPLOYMENT.md)](DEPLOYMENT.md)**: 如何安装、配置和启动项目。
- **[项目架构 (PROJECT_ARCHITECTURE.md)](PROJECT_ARCHITECTURE.md)**: 系统架构、技术栈和数据库设计说明。
- **[API 文档 (API_DOCUMENTATION.md)](API_DOCUMENTATION.md)**: 后端接口详细说明。

## ✨ 主要功能

- **多用户支持**: 完整的用户注册、登录和权限认证系统。
- **班级管理**: 创建、编辑班级，关联学生和课程。
- **数据隔离**: 用户只能看到自己创建的数据。
- **现代化UI**: 基于 Vue 3 的 Glassmorphism 设计风格。
- **课程库**: 共享的课程资源库。

## 🛠 技术栈

### Backend
- Node.js & Express
- MySQL & Sequelize ORM
- JWT Authentication

### Frontend
- Vue 3 & Composition API
- Pinia State Management
- Vue Router

## 🚀 快速开始

详细步骤请参考 **[部署指南](DEPLOYMENT.md)**。

```bash
# 1. 克隆项目
git clone https://github.com/20empty/zj-classroom.git

# 2. 安装依赖
cd backend && npm install
cd ../web && npm install

# 3. 配置环境 (.env)
# 4. 启动服务
# 后端 (http://localhost:3001)
npm start
# 前端 (http://localhost:8080)
npm run serve
```

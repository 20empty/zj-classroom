const sequelize = require('../config/database');
const Class = require('./Class');
const Student = require('./Student');
const Todo = require('./Todo');
const CourseLibrary = require('./CourseLibrary');
const Announcement = require('./Announcement');
const User = require('./User'); // Import User model

// 定义模型关联
Class.hasMany(Student, { foreignKey: 'classId', as: 'students' });
Student.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

Class.hasMany(Todo, { foreignKey: 'classId', as: 'todos' });
Todo.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

Class.hasMany(Announcement, { foreignKey: 'classId', as: 'announcements' });
Announcement.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

User.hasMany(Class, { foreignKey: 'userId', as: 'classes' });
Class.belongsTo(User, { foreignKey: 'userId', as: 'creator' });

// 初始化数据库
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 同步数据库（创建表）
    await sequelize.sync({ force: false }); // force: true 会删除现有表
    console.log('数据库表同步成功');

    // 初始化示例数据
    await initSampleData();

  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
};


// 初始化示例数据
const initSampleData = async () => {
  try {
    // 检查是否已有数据
    const classCount = await Class.count();
    if (classCount > 0) {
      console.log('数据库已有数据，跳过示例数据初始化');
      return;
    }

    // 创建示例班级
    const sampleClass = await Class.create({
      name: '华为云HCS培训示范班级',
      teacher: '李老师',
      image: '/img/orange-logo.png',
      contractNumber: 'HT2024-001',
      classId: 'HCS-2024-001',
      location: '杭州华为培训中心',
      date: '2024-01-15',
      customer: '华为技术有限公司',
      coordinator: '张老师'
    });

    // 创建示例课程库
    const sampleCourses = [
      {
        name: '华为云HCS架构设计',
        description: '华为云HCS整体架构、设计原则、最佳实践',
        duration: '2',
        category: '华为云'
      },
      {
        name: 'HCS部署与配置',
        description: 'HCS环境搭建、网络配置、存储配置、安全配置',
        duration: '3',
        category: '华为云'
      },
      {
        name: 'HCS运维管理',
        description: '日常运维、监控告警、备份恢复、性能优化',
        duration: '2',
        category: '华为云'
      }
    ];

    for (const courseData of sampleCourses) {
      await CourseLibrary.create(courseData);
    }

    // 创建示例班级课程
    const classCourses = [
      {
        classId: sampleClass.id,
        title: '华为云HCS架构设计',
        duration: '2',
        content: '华为云HCS整体架构、设计原则、最佳实践',
        type: '课程库课程',
        courseLibraryId: 1
      },
      {
        classId: sampleClass.id,
        title: 'HCS部署与配置',
        duration: '3',
        content: 'HCS环境搭建、网络配置、存储配置、安全配置',
        type: '课程库课程',
        courseLibraryId: 2
      },
      {
        classId: sampleClass.id,
        title: 'HCS运维管理',
        duration: '2',
        content: '日常运维、监控告警、备份恢复、性能优化',
        type: '自定义课程'
      }
    ];

    // 课程数据现在存储在Class表的courses JSON字段中
    console.log('课程数据将通过前端界面手动添加');

    // 创建示例待办事项
    const sampleTodos = [
      {
        classId: sampleClass.id,
        text: '准备培训材料',
        status: 'done',
        date: '2024-01-14'
      },
      {
        classId: sampleClass.id,
        text: '联系参训学员',
        status: 'done',
        date: '2024-01-14'
      },
      {
        classId: sampleClass.id,
        text: '检查培训环境',
        status: 'doing',
        date: '2024-01-15'
      },
      {
        classId: sampleClass.id,
        text: '开始培训课程',
        status: 'planning',
        date: '2024-01-15'
      },
      {
        classId: sampleClass.id,
        text: '收集学员反馈',
        status: 'planning',
        date: '2024-01-18'
      },
      {
        classId: sampleClass.id,
        text: '培训总结报告',
        status: 'planning',
        date: '2024-01-19'
      }
    ];

    for (const todoData of sampleTodos) {
      await Todo.create(todoData);
    }

    console.log('示例数据初始化完成');
  } catch (error) {
    console.error('示例数据初始化失败:', error);
  }
};

module.exports = {
  sequelize,
  Class,
  Student,
  Todo,
  CourseLibrary,
  Announcement,
  User,
  initDatabase
};

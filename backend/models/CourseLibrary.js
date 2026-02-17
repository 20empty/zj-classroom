const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseLibrary = sequelize.define('CourseLibrary', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '课程名称'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '课程描述'
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '课程时长'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '课程分类'
  }
}, {
  tableName: 'course_library',
  comment: '课程库表'
});

module.exports = CourseLibrary;

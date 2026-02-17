const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '班级名称'
  },
  teacher: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '讲师'
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '班级图片'
  },
  contractNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '合同号'
  },
  classId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '班号'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '交付地'
  },
  date: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '培训时间'
  },
  customer: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '培训对象'
  },
  coordinator: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '班主任'
  },
  courses: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: '班级课程列表'
  }
}, {
  tableName: 'classes',
  comment: '班级表'
});

module.exports = Class;

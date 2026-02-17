const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Announcement = sequelize.define('Announcement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '公告内容'
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '文件路径或URL'
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '关联班级ID'
  }
}, {
  tableName: 'announcements',
  comment: '公告表'
});

module.exports = Announcement;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '所属班级ID',
    references: {
      model: 'classes',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '学生姓名'
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '积分'
  },
  records: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: '积分记录'
  }
}, {
  tableName: 'students',
  comment: '学生表'
});

module.exports = Student;

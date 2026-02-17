const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Todo = sequelize.define('Todo', {
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
  text: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '待办事项内容'
  },
  status: {
    type: DataTypes.ENUM('planning', 'doing', 'done'),
    defaultValue: 'planning',
    comment: '状态'
  },
  date: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '日期'
  }
}, {
  tableName: 'todos',
  comment: '待办事项表'
});

module.exports = Todo;

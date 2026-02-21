const express = require('express');
const router = express.Router();
const { Todo, Class } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

// 获取班级的所有待办事项
router.get('/class/:classId', asyncHandler(async (req, res) => {
  const todos = await Todo.findAll({
    where: { classId: req.params.classId },
    order: [['date', 'ASC'], ['createdAt', 'DESC']]
  });
  res.json(todos);
}));

// 创建待办事项
router.post('/', asyncHandler(async (req, res) => {
  const todo = await Todo.create(req.body);
  res.status(201).json(todo);
}));

// 更新待办事项
router.put('/:id', asyncHandler(async (req, res) => {
  const [updated] = await Todo.update(req.body, {
    where: { id: req.params.id }
  });
  if (updated) {
    const updatedTodo = await Todo.findByPk(req.params.id);
    res.json(updatedTodo);
  } else {
    res.status(404).json({ error: '待办事项不存在' });
  }
}));

// 删除待办事项
router.delete('/:id', asyncHandler(async (req, res) => {
  const deleted = await Todo.destroy({
    where: { id: req.params.id }
  });
  if (deleted) {
    res.json({ message: '待办事项删除成功' });
  } else {
    res.status(404).json({ error: '待办事项不存在' });
  }
}));

module.exports = router;

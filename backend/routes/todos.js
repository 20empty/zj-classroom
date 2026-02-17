const express = require('express');
const router = express.Router();
const { Todo, Class } = require('../models');

// 获取班级的所有待办事项
router.get('/class/:classId', async (req, res) => {
  try {
    const todos = await Todo.findAll({
      where: { classId: req.params.classId },
      order: [['date', 'ASC'], ['createdAt', 'DESC']]
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建待办事项
router.post('/', async (req, res) => {
  try {
    const todo = await Todo.create(req.body);
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新待办事项
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Todo.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedTodo = await Todo.findByPk(req.params.id);
      res.json(updatedTodo);
    } else {
      res.status(404).json({ error: '待办事项不存在' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除待办事项
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Todo.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.json({ message: '待办事项删除成功' });
    } else {
      res.status(404).json({ error: '待办事项不存在' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

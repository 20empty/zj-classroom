const express = require('express');
const router = express.Router();
const { Class, Student, Todo } = require('../models');

// 获取所有班级
router.get('/', async (req, res) => {
  try {
    const classes = await Class.findAll({
      include: [
        { model: Student, as: 'students' },
        { model: Todo, as: 'todos' }
      ]
    });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个班级
router.get('/:id', async (req, res) => {
  try {
    const classItem = await Class.findByPk(req.params.id, {
      include: [
        { model: Student, as: 'students' },
        { model: Todo, as: 'todos' }
      ]
    });
    if (!classItem) {
      return res.status(404).json({ error: '班级不存在' });
    }
    res.json(classItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建班级
router.post('/', async (req, res) => {
  try {
    const classItem = await Class.create(req.body);
    res.status(201).json(classItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新班级
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Class.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedClass = await Class.findByPk(req.params.id);
      res.json(updatedClass);
    } else {
      res.status(404).json({ error: '班级不存在' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除班级
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Class.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.json({ message: '班级删除成功' });
    } else {
      res.status(404).json({ error: '班级不存在' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

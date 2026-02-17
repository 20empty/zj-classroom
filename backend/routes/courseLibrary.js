const express = require('express');
const router = express.Router();
const { CourseLibrary } = require('../models');

// 获取所有课程库课程
router.get('/', async (req, res) => {
  try {
    const courses = await CourseLibrary.findAll({
      order: [['name', 'ASC']]
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个课程库课程
router.get('/:id', async (req, res) => {
  try {
    const course = await CourseLibrary.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ error: '课程不存在' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建课程库课程
router.post('/', async (req, res) => {
  try {
    const course = await CourseLibrary.create(req.body);
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新课程库课程
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await CourseLibrary.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedCourse = await CourseLibrary.findByPk(req.params.id);
      res.json(updatedCourse);
    } else {
      res.status(404).json({ error: '课程不存在' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除课程库课程
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await CourseLibrary.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.json({ message: '课程删除成功' });
    } else {
      res.status(404).json({ error: '课程不存在' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

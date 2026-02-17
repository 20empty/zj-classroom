const express = require('express');
const router = express.Router();
const { Student, Class } = require('../models');

// 获取班级的所有学生
router.get('/class/:classId', async (req, res) => {
  try {
    const students = await Student.findAll({
      where: { classId: req.params.classId },
      order: [['points', 'DESC']]
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建学生
router.post('/', async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新学生
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Student.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedStudent = await Student.findByPk(req.params.id);
      res.json(updatedStudent);
    } else {
      res.status(404).json({ error: '学生不存在' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除学生
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Student.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.json({ message: '学生删除成功' });
    } else {
      res.status(404).json({ error: '学生不存在' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 给学生加分
router.post('/:id/add-points', async (req, res) => {
  try {
    const { points, description } = req.body;
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ error: '学生不存在' });
    }

    // 更新积分
    student.points += points;
    
    // 添加积分记录
    const newRecord = {
      date: new Date().toLocaleString(),
      points,
      description
    };
    student.records.unshift(newRecord);
    
    await student.save();
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

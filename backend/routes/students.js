const express = require('express');
const router = express.Router();
const { Student, Class } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

// 获取班级的所有学生
router.get('/class/:classId', asyncHandler(async (req, res) => {
  const students = await Student.findAll({
    where: { classId: req.params.classId },
    order: [['points', 'DESC']]
  });
  res.json(students);
}));

// 创建学生
router.post('/', asyncHandler(async (req, res) => {
  const student = await Student.create(req.body);
  res.status(201).json(student);
}));

// 更新学生
router.put('/:id', asyncHandler(async (req, res) => {
  const [updated] = await Student.update(req.body, {
    where: { id: req.params.id }
  });
  if (updated) {
    const updatedStudent = await Student.findByPk(req.params.id);
    res.json(updatedStudent);
  } else {
    res.status(404).json({ error: '学生不存在' });
  }
}));

// 删除学生
router.delete('/:id', asyncHandler(async (req, res) => {
  const deleted = await Student.destroy({
    where: { id: req.params.id }
  });
  if (deleted) {
    res.json({ message: '学生删除成功' });
  } else {
    res.status(404).json({ error: '学生不存在' });
  }
}));

// 给学生加分
router.post('/:id/add-points', asyncHandler(async (req, res) => {
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
}));

module.exports = router;

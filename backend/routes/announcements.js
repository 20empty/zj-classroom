const express = require('express');
const router = express.Router();
const { Announcement, Class } = require('../models');

// 获取班级的公告列表
router.get('/class/:classId', async (req, res) => {
  try {
    const announcements = await Announcement.findAll({
      where: { classId: req.params.classId },
      order: [['createdAt', 'DESC']]
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建公告
router.post('/', async (req, res) => {
  try {
    const { text, filePath, classId } = req.body;

    if (!text || !classId) {
      return res.status(400).json({ error: '公告内容和班级ID不能为空' });
    }

    const announcement = await Announcement.create({
      text,
      filePath: filePath || '',
      classId
    });

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新公告
router.put('/:id', async (req, res) => {
  try {
    const { text, filePath } = req.body;

    const [updated] = await Announcement.update(
      { text, filePath },
      { where: { id: req.params.id } }
    );

    if (updated) {
      const updatedAnnouncement = await Announcement.findByPk(req.params.id);
      res.json(updatedAnnouncement);
    } else {
      res.status(404).json({ error: '公告不存在' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除公告
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Announcement.destroy({
      where: { id: req.params.id }
    });

    if (deleted) {
      res.json({ message: '公告删除成功' });
    } else {
      res.status(404).json({ error: '公告不存在' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

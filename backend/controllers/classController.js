const { Class, Student, Todo } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

// Get all classes for the current user
exports.getAllClasses = asyncHandler(async (req, res) => {
    const classes = await Class.findAll({
        where: { userId: req.user.id },
        include: [
            { model: Student, as: 'students' },
            { model: Todo, as: 'todos' }
        ],
        order: [['createdAt', 'DESC']]
    });
    res.json(classes);
});

// Get a single class by ID (ensure it belongs to the user)
exports.getClassById = asyncHandler(async (req, res) => {
    const classItem = await Class.findOne({
        where: {
            id: req.params.id,
            userId: req.user.id
        },
        include: [
            { model: Student, as: 'students' },
            { model: Todo, as: 'todos' }
        ]
    });

    if (!classItem) {
        return res.status(404).json({ error: '班级不存在或无权访问' });
    }
    res.json(classItem);
});

// Create a new class
exports.createClass = asyncHandler(async (req, res) => {
    const classItem = await Class.create({
        ...req.body,
        userId: req.user.id
    });
    res.status(201).json(classItem);
});

// Update a class
exports.updateClass = asyncHandler(async (req, res) => {
    const [updated] = await Class.update(req.body, {
        where: {
            id: req.params.id,
            userId: req.user.id
        }
    });

    if (updated) {
        const updatedClass = await Class.findByPk(req.params.id);
        res.json(updatedClass);
    } else {
        res.status(404).json({ error: '班级不存在或无权访问' });
    }
});

// Delete a class
exports.deleteClass = asyncHandler(async (req, res) => {
    const deleted = await Class.destroy({
        where: {
            id: req.params.id,
            userId: req.user.id
        }
    });

    if (deleted) {
        res.json({ message: '班级删除成功' });
    } else {
        res.status(404).json({ error: '班级不存在或无权访问' });
    }
});

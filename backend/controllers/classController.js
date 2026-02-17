const { Class, Student, Todo } = require('../models');

// Get all classes for the current user
exports.getAllClasses = async (req, res) => {
    try {
        const classes = await Class.findAll({
            where: { userId: req.user.id },
            include: [
                { model: Student, as: 'students' },
                { model: Todo, as: 'todos' }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(classes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single class by ID (ensure it belongs to the user)
exports.getClassById = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new class
exports.createClass = async (req, res) => {
    try {
        const classItem = await Class.create({
            ...req.body,
            userId: req.user.id
        });
        res.status(201).json(classItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a class
exports.updateClass = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a class
exports.deleteClass = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

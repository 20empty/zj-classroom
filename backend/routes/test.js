const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

router.get('/hello', testController.hello);
router.post('/qwen-vl', testController.qwenVl);

module.exports = router;

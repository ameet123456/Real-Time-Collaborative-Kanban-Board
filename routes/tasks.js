const express = require('express');
const router = express.Router();
const { createTask, updateTask, deleteTask, moveTask } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', createTask);
router.route('/:id').patch(updateTask).delete(deleteTask);
router.patch('/:id/move', moveTask);

module.exports = router;
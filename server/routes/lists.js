const express = require('express');
const router = express.Router();
const { createList, updateList, deleteList } = require('../controllers/listController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', createList);
router.route('/:id').patch(updateList).delete(deleteList);

module.exports = router;

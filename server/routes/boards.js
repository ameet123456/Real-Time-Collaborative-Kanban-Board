const express = require('express');
const router = express.Router();
const {
  getBoards, createBoard, getBoard, updateBoard, deleteBoard, inviteMember, removeMember
} = require('../server/controllers/boardController');
const { protect } = require('../server/middleware/auth');

router.use(protect);

router.route('/').get(getBoards).post(createBoard);
router.route('/:id').get(getBoard).patch(updateBoard).delete(deleteBoard);
router.post('/:id/invite', inviteMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;
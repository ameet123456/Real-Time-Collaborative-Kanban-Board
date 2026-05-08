const List = require('../modeles/List');
const Task = require('../modeles/Task');
const Board = require('../modeles/Board');

const isBoardMember = async (boardId, userId) => {
  const board = await Board.findById(boardId);
  if (!board) return false;
  return board.members.some((m) => m.user.toString() === userId.toString());
};

// @route POST /api/lists
exports.createList = async (req, res, next) => {
  try {
    const { title, boardId } = req.body;
    if (!title || !boardId) return res.status(400).json({ success: false, message: 'Title and boardId are required' });

    if (!(await isBoardMember(boardId, req.user._id))) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const lastList = await List.findOne({ board: boardId }).sort('-position');
    const position = lastList ? lastList.position + 1 : 0;

    const list = await List.create({ title, board: boardId, position });

    req.io?.to(boardId).emit('list:created', list);
    res.status(201).json({ success: true, list });
  } catch (error) { next(error); }
};

// @route PATCH /api/lists/:id
exports.updateList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ success: false, message: 'List not found' });

    if (!(await isBoardMember(list.board, req.user._id))) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { title, position } = req.body;
    if (title) list.title = title;
    if (position !== undefined) list.position = position;

    await list.save();

    req.io?.to(list.board.toString()).emit('list:updated', list);
    res.json({ success: true, list });
  } catch (error) { next(error); }
};

// @route DELETE /api/lists/:id
exports.deleteList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ success: false, message: 'List not found' });

    if (!(await isBoardMember(list.board, req.user._id))) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const boardId = list.board.toString();
    await Task.deleteMany({ list: list._id });
    await list.deleteOne();

    req.io?.to(boardId).emit('list:deleted', { listId: req.params.id });
    res.json({ success: true, message: 'List deleted' });
  } catch (error) { next(error); }
};
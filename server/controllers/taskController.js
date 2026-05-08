const Task = require('../modeles/Task');
const List = require('../modeles/List');
const Board = require('../modeles/Board');

const isBoardMember = async (boardId, userId) => {
  const board = await Board.findById(boardId);
  if (!board) return false;
  return board.members.some((m) => m.user.toString() === userId.toString());
};

// @route POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, listId, boardId, assignedTo, dueDate, priority, labels } = req.body;

    if (!title || !listId || !boardId) {
      return res.status(400).json({ success: false, message: 'Title, listId and boardId are required' });
    }

    if (!(await isBoardMember(boardId, req.user._id))) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const lastTask = await Task.findOne({ list: listId }).sort('-position');
    const position = lastTask ? lastTask.position + 1 : 0;

    const task = await Task.create({
      title, description, list: listId, board: boardId,
      assignedTo: assignedTo || null, dueDate: dueDate || null,
      priority: priority || 'medium', labels: labels || [],
      position, createdBy: req.user._id,
    });

    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    req.io?.to(boardId).emit('task:created', task);
    res.status(201).json({ success: true, task });
  } catch (error) { next(error); }
};

// @route PATCH /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (!(await isBoardMember(task.board, req.user._id))) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { title, description, listId, assignedTo, dueDate, priority, labels, position } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (listId !== undefined) task.list = listId;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    if (priority !== undefined) task.priority = priority;
    if (labels !== undefined) task.labels = labels;
    if (position !== undefined) task.position = position;

    await task.save();
    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    req.io?.to(task.board.toString()).emit('task:updated', task);
    res.json({ success: true, task });
  } catch (error) { next(error); }
};

// @route DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (!(await isBoardMember(task.board, req.user._id))) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const boardId = task.board.toString();
    const taskId = task._id.toString();
    await task.deleteOne();

    req.io?.to(boardId).emit('task:deleted', { taskId });
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) { next(error); }
};

// @route PATCH /api/tasks/:id/move
exports.moveTask = async (req, res, next) => {
  try {
    const { listId, position } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (!(await isBoardMember(task.board, req.user._id))) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    task.list = listId;
    task.position = position;
    await task.save();
    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    req.io?.to(task.board.toString()).emit('task:moved', task);
    res.json({ success: true, task });
  } catch (error) { next(error); }
};
const Board = require('../modeles/Board');
const List = require('../modeles/List');
const Task = require('../modeles/Task');
const User = require('../modeles/User');

// @route GET /api/boards
exports.getBoards = async (req, res, next) => {
  try {
    const boards = await Board.find({ 'members.user': req.user._id })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort('-createdAt');
    res.json({ success: true, boards });
  } catch (error) { next(error); }
};

// @route POST /api/boards
exports.createBoard = async (req, res, next) => {
  try {
    const { name, description, background } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Board name is required' });

    const board = await Board.create({ name, description, background, owner: req.user._id });
    await board.populate('owner', 'name email avatar');
    await board.populate('members.user', 'name email avatar');

    // Emit socket event
    req.io?.emit('board:created', board);

    res.status(201).json({ success: true, board });
  } catch (error) { next(error); }
};

// @route GET /api/boards/:id
exports.getBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!board) return res.status(404).json({ success: false, message: 'Board not found' });

    const isMember = board.members.some((m) => m.user._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Access denied' });

    const lists = await List.find({ board: board._id }).sort('position');
    const tasks = await Task.find({ board: board._id })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort('position');

    res.json({ success: true, board, lists, tasks });
  } catch (error) { next(error); }
};

// @route PATCH /api/boards/:id
exports.updateBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ success: false, message: 'Board not found' });

    const isAdmin = board.members.some(
      (m) => m.user.toString() === req.user._id.toString() && m.role === 'admin'
    );
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Only admins can update the board' });

    const { name, description, background } = req.body;
    if (name) board.name = name;
    if (description !== undefined) board.description = description;
    if (background) board.background = background;

    await board.save();
    await board.populate('owner', 'name email avatar');
    await board.populate('members.user', 'name email avatar');

    req.io?.to(req.params.id).emit('board:updated', board);
    res.json({ success: true, board });
  } catch (error) { next(error); }
};

// @route DELETE /api/boards/:id
exports.deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ success: false, message: 'Board not found' });

    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the owner can delete this board' });
    }

    await Task.deleteMany({ board: board._id });
    await List.deleteMany({ board: board._id });
    await board.deleteOne();

    req.io?.to(req.params.id).emit('board:deleted', { boardId: req.params.id });
    res.json({ success: true, message: 'Board deleted' });
  } catch (error) { next(error); }
};

// @route POST /api/boards/:id/invite
exports.inviteMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ success: false, message: 'Board not found' });

    const isAdmin = board.members.some(
      (m) => m.user.toString() === req.user._id.toString() && m.role === 'admin'
    );
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Only admins can invite members' });

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) return res.status(404).json({ success: false, message: 'User not found with that email' });

    const alreadyMember = board.members.some(
      (m) => m.user.toString() === userToInvite._id.toString()
    );
    if (alreadyMember) return res.status(400).json({ success: false, message: 'User is already a member' });

    board.members.push({ user: userToInvite._id, role: role || 'member' });
    await board.save();
    await board.populate('members.user', 'name email avatar');

    req.io?.to(req.params.id).emit('board:memberAdded', { board, newMember: userToInvite });
    res.json({ success: true, board });
  } catch (error) { next(error); }
};

// @route DELETE /api/boards/:id/members/:userId
exports.removeMember = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ success: false, message: 'Board not found' });

    const isAdmin = board.members.some(
      (m) => m.user.toString() === req.user._id.toString() && m.role === 'admin'
    );
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Only admins can remove members' });

    if (board.owner.toString() === req.params.userId) {
      return res.status(400).json({ success: false, message: 'Cannot remove the board owner' });
    }

    board.members = board.members.filter((m) => m.user.toString() !== req.params.userId);
    await board.save();
    await board.populate('members.user', 'name email avatar');

    req.io?.to(req.params.id).emit('board:memberRemoved', { board, removedUserId: req.params.userId });
    res.json({ success: true, board });
  } catch (error) { next(error); }
};
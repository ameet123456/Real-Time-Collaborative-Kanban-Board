const jwt = require('jsonwebtoken');
const User = require('./modeles/User');

module.exports = (io) => {
  // Authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id).select('-password');
      if (!socket.user) return next(new Error('User not found'));
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.name} (${socket.id})`);

    // Join a board room
    socket.on('board:join', (boardId) => {
      socket.join(boardId);
      socket.to(boardId).emit('user:joined', {
        userId: socket.user._id,
        name: socket.user.name,
        avatar: socket.user.avatar,
      });
      console.log(`${socket.user.name} joined board room: ${boardId}`);
    });

    // Leave a board room
    socket.on('board:leave', (boardId) => {
      socket.leave(boardId);
      socket.to(boardId).emit('user:left', { userId: socket.user._id });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.user.name}`);
    });
  });
};
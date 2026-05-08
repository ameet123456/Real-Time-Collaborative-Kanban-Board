require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const socketHandler = require('./socket');

const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/boards');
const listRoutes = require('./routes/lists');
const taskRoutes = require('./routes/tasks');

// Connect Database
connectDB();

const app = express();
const server = http.createServer(app);

// Frontend URL
const CLIENT_URL =
  process.env.CLIENT_URL ||
  'https://real-time-collaborative-kanban-boar-six.vercel.app';

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// Attach io to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Kanban API running',
  });
});

// Error Handler
app.use(errorHandler);

// Socket Handler
socketHandler(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} in ${
      process.env.NODE_ENV || 'development'
    } mode`
  );
});

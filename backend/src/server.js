const app = require('./app'); // Express app
const http = require('http');
const { Server } = require('socket.io');

// Create HTTP server
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // replace with frontend URL in production
    methods: ['GET', 'POST'],
  },
});

// Attach io to the Express app instance
app.set('io', io);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinClassRoom', (classCode) => {
    socket.join(classCode);
    console.log(`Socket ${socket.id} joined room ${classCode}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

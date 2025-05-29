// Simple Socket.IO Express server for testing
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve the test HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/socketio_test.html');
});

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send welcome message
  socket.emit('message', 'Welcome to the test server!');
  
  // Handle custom events
  socket.on('test', (data) => {
    console.log('Received test event:', data);
    socket.emit('test_response', `Server received: ${JSON.stringify(data)}`);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Socket.IO test server running at http://localhost:${PORT}`);
  console.log('Connect using the socketio_test.html page');
});

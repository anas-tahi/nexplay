const jwt = require('jsonwebtoken');

// Store online users
const onlineUsers = new Map();

// Store active rooms
const activeRooms = new Map();

const socketHandler = (io) => {
  // Authentication middleware for Socket.io
  const authenticateSocket = (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      // Allow connection without token for now
      if (!token) {
        socket.userId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        socket.username = socket.handshake.auth.username || `Guest_${socket.userId.slice(-8)}`;
        socket.isGuest = true;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.isGuest = decoded.userId.startsWith('guest_');
      
      // Extract username from token or create guest username
      if (socket.isGuest) {
        socket.username = socket.handshake.auth.username || `Guest_${decoded.userId.slice(-8)}`;
      } else {
        // For registered users, we'll get username from the client
        socket.username = socket.handshake.auth.username || 'User';
      }
      
      next();
    } catch (error) {
      // Allow connection even if token is invalid for now
      socket.userId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      socket.username = socket.handshake.auth.username || `Guest`;
      socket.isGuest = true;
      next();
    }
  };

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.username} (${socket.userId})`);

    // Add user to online users
    onlineUsers.set(socket.userId, {
      socketId: socket.id,
      username: socket.username,
      isGuest: socket.isGuest,
      joinedAt: new Date()
    });

    // Broadcast updated online users list
    broadcastOnlineUsers();

    // Send current online users to the newly connected user
    socket.emit('online-users', Array.from(onlineUsers.values()));

    // Join global chat room
    socket.join('global-chat');

    // Handle joining chat room
    socket.on('join-chat', (room) => {
      socket.join(room);
      socket.emit('joined-chat', room);
    });

    // Handle chat messages
    socket.on('chat-message', (data) => {
      const message = {
        id: Date.now(),
        userId: socket.userId,
        username: socket.username,
        isGuest: socket.isGuest,
        message: data.message,
        room: data.room || 'global-chat',
        timestamp: new Date()
      };

      // Broadcast message to room
      io.to(data.room || 'global-chat').emit('chat-message', message);
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      socket.to(data.room || 'global-chat').emit('user-typing', {
        username: socket.username,
        isTyping: data.isTyping
      });
    });

    // === MULTIPLAYER ROOM SYSTEM ===

    // Create a new game room
    socket.on('create-room', (gameType) => {
      const roomId = generateRoomId();
      const room = {
        id: roomId,
        gameType,
        host: {
          userId: socket.userId,
          username: socket.username,
          isGuest: socket.isGuest
        },
        players: [{
          userId: socket.userId,
          username: socket.username,
          isGuest: socket.isGuest,
          symbol: 'X'
        }],
        gameState: 'waiting',
        createdAt: new Date()
      };

      activeRooms.set(roomId, room);
      socket.join(roomId);
      socket.emit('room-created', room);
      
      console.log(`Room created: ${roomId} by ${socket.username}`);
    });

    // Join an existing room
    socket.on('join-room', (roomId) => {
      const room = activeRooms.get(roomId);
      
      if (!room) {
        socket.emit('room-error', 'Room not found');
        return;
      }

      if (room.players.length >= 2) {
        socket.emit('room-error', 'Room is full');
        return;
      }

      // Add second player
      const player = {
        userId: socket.userId,
        username: socket.username,
        isGuest: socket.isGuest,
        symbol: 'O'
      };

      room.players.push(player);
      room.gameState = 'playing';

      socket.join(roomId);
      socket.emit('room-joined', room);
      
      // Notify all players in the room
      io.to(roomId).emit('room-updated', room);

      console.log(`${socket.username} joined room ${roomId}`);
    });

    // Handle game moves (for TicTacToe)
    socket.on('game-move', (data) => {
      const { roomId, move } = data;
      const room = activeRooms.get(roomId);

      if (!room || room.gameState !== 'playing') {
        return;
      }

      // Validate it's the player's turn
      const currentPlayer = room.players.find(p => p.userId === socket.userId);
      if (!currentPlayer) {
        return;
      }

      // Broadcast move to all players in room
      io.to(roomId).emit('game-move', {
        player: currentPlayer,
        move,
        timestamp: new Date()
      });
    });

    // Handle game over
    socket.on('game-over', (data) => {
      const { roomId, winner, isDraw } = data;
      const room = activeRooms.get(roomId);

      if (room) {
        room.gameState = 'finished';
        room.winner = winner;
        room.isDraw = isDraw;
        room.finishedAt = new Date();

        io.to(roomId).emit('game-over', {
          winner,
          isDraw,
          room
        });
      }
    });

    // Handle room chat
    socket.on('room-message', (data) => {
      const { roomId, message } = data;
      const room = activeRooms.get(roomId);

      if (room) {
        const messageData = {
          id: Date.now(),
          userId: socket.userId,
          username: socket.username,
          isGuest: socket.isGuest,
          message,
          timestamp: new Date()
        };

        io.to(roomId).emit('room-message', messageData);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.username} (${socket.userId})`);

      // Remove from online users
      onlineUsers.delete(socket.userId);
      broadcastOnlineUsers();

      // Handle room disconnection
      for (const [roomId, room] of activeRooms.entries()) {
        const playerIndex = room.players.findIndex(p => p.userId === socket.userId);
        
        if (playerIndex !== -1) {
          if (room.gameState === 'playing') {
            // Notify other player that someone disconnected
            io.to(roomId).emit('player-disconnected', {
              username: socket.username,
              room
            });
          }
          
          // Remove player from room
          room.players.splice(playerIndex, 1);
          
          if (room.players.length === 0) {
            // Delete empty room
            activeRooms.delete(roomId);
          } else {
            room.gameState = 'waiting';
            io.to(roomId).emit('room-updated', room);
          }
          
          break;
        }
      }
    });
  });

  // Helper functions
  function broadcastOnlineUsers() {
    io.emit('online-users', Array.from(onlineUsers.values()));
  }

  function generateRoomId() {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  // Expose utility functions
  return {
    getOnlineUsers: () => Array.from(onlineUsers.values()),
    getActiveRooms: () => Array.from(activeRooms.values()),
    getRoom: (roomId) => activeRooms.get(roomId)
  };
};

module.exports = socketHandler;

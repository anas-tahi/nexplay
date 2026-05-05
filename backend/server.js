require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Import routes
const authRoutes = require('./routes/authRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const profileRoutes = require('./routes/profileRoutes');
const friendsRoutes = require('./routes/friendsRoutes');
const eloRoutes = require('./routes/eloRoutes');
const socketHandler = require('./socket/socketHandler');
const { initializeAchievements } = require('./controllers/profileController');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Initialize Socket.io
const socketUtils = socketHandler(io);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/elo', eloRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'NexPlay backend is running',
    timestamp: new Date().toISOString(),
    onlineUsers: socketUtils.getOnlineUsers().length,
    activeRooms: socketUtils.getActiveRooms().length
  });
});

// Get online users (public endpoint)
app.get('/api/online-users', (req, res) => {
  const users = socketUtils.getOnlineUsers().map(user => ({
    username: user.username,
    isGuest: user.isGuest,
    joinedAt: user.joinedAt
  }));
  res.json(users);
});

// Get active rooms (public endpoint)
app.get('/api/active-rooms', (req, res) => {
  const rooms = socketUtils.getActiveRooms().map(room => ({
    id: room.id,
    gameType: room.gameType,
    host: room.host,
    playerCount: room.players.length,
    gameState: room.gameState,
    createdAt: room.createdAt
  }));
  res.json(rooms);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Mock data for immediate testing
const mockUsers = [];
const mockProfiles = [];
const mockScores = [];
const mockTournaments = [];
let nextUserId = 1;
let nextScoreId = 1;
let nextTournamentId = 1;

// Mock database operations
const mockDB = {
  users: {
    findOne: (query) => Promise.resolve(mockUsers.find(u => u.email === query.email || u._id.toString() === query._id)),
    create: (data) => {
      const user = { _id: nextUserId++, ...data, createdAt: new Date() };
      mockUsers.push(user);
      return Promise.resolve(user);
    }
  },
  profiles: {
    findOne: (query) => Promise.resolve(mockProfiles.find(p => p.user.toString() === query.user.toString())),
    create: (data) => {
      const profile = { _id: nextUserId++, ...data, createdAt: new Date() };
      mockProfiles.push(profile);
      return Promise.resolve(profile);
    },
    save: (profile) => Promise.resolve(profile)
  },
  scores: {
    create: (data) => {
      const score = { _id: nextScoreId++, ...data, createdAt: new Date() };
      mockScores.push(score);
      return Promise.resolve(score);
    },
    find: (query) => Promise.resolve(mockScores.filter(s => s.game === query.game)),
    sort: (sort) => ({ limit: (n) => Promise.resolve(mockScores.sort((a, b) => b.score - a.score).slice(0, n)) })
  },
  tournaments: {
    find: (query) => Promise.resolve(mockTournaments),
    create: (data) => {
      const tournament = { _id: nextTournamentId++, ...data, createdAt: new Date() };
      mockTournaments.push(tournament);
      return Promise.resolve(tournament);
    },
    findById: (id) => Promise.resolve(mockTournaments.find(t => t._id === id)),
    save: (tournament) => Promise.resolve(tournament)
  }
};

// Connect to MongoDB and auto-create databases
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  // Auto-create databases and collections
  const db = mongoose.connection.db;
  
  // Create collections if they don't exist
  const collections = ['users', 'profiles', 'scores', 'tournaments', 'friendrequests', 'achievements'];
  
  for (const collectionName of collections) {
    try {
      const exists = await db.listCollections({ name: collectionName });
      if (exists.length === 0) {
        console.log(`📁 Creating collection: ${collectionName}`);
        await db.createCollection(collectionName);
      }
    } catch (error) {
      console.log(`Collection ${collectionName} already exists or error:`, error.message);
    }
  }
  
  // Initialize achievements in database
  initializeAchievements();
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  console.log('� Falling back to mock database...');
  
  // Fallback to mock database if MongoDB fails
  const mockUsers = [];
  const mockProfiles = [];
  const mockScores = [];
  const mockTournaments = [];
  let nextUserId = 1;
  let nextScoreId = 1;
  let nextTournamentId = 1;

  // Mock database operations
  const mockDB = {
    users: {
      findOne: (query) => Promise.resolve(mockUsers.find(u => u.email === query.email || u._id.toString() === query._id)),
      create: (data) => {
        const user = { _id: nextUserId++, ...data, createdAt: new Date() };
        mockUsers.push(user);
        return Promise.resolve(user);
      }
    },
    profiles: {
      findOne: (query) => Promise.resolve(mockProfiles.find(p => p.user.toString() === query.user.toString())),
      create: (data) => {
        const profile = { _id: nextUserId++, ...data, createdAt: new Date() };
        mockProfiles.push(profile);
        return Promise.resolve(profile);
      },
      save: (profile) => Promise.resolve(profile)
    },
    scores: {
      create: (data) => {
        const score = { _id: nextScoreId++, ...data, createdAt: new Date() };
        mockScores.push(score);
        return Promise.resolve(score);
      },
      find: (query) => Promise.resolve(mockScores.filter(s => s.game === query.game)),
      sort: (sort) => ({ limit: (n) => Promise.resolve(mockScores.sort((a, b) => b.score - a.score).slice(0, n)) })
    },
    tournaments: {
      find: (query) => Promise.resolve(mockTournaments),
      create: (data) => {
        const tournament = { _id: nextTournamentId++, ...data, createdAt: new Date() };
        mockTournaments.push(tournament);
        return Promise.resolve(tournament);
      },
      findById: (id) => Promise.resolve(mockTournaments.find(t => t._id === id)),
      save: (tournament) => Promise.resolve(tournament)
    }
  };

  // Override models to use mockDB if MongoDB fails
  require.cache[require.resolve('./models/User')] = mockDB.users;
  require.cache[require.resolve('./models/Profile')] = mockDB.profiles;
  require.cache[require.resolve('./models/Score')] = mockDB.scores;
  require.cache[require.resolve('./models/Tournament')] = mockDB.tournaments;
  
  console.log('🚀 Using hybrid database system (MongoDB + Fallback)');
});

// Start server
server.listen(PORT, () => {
  console.log(`NexPlay backend server running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/api/health`);
  console.log(`Socket.io server ready for real-time features`);
});

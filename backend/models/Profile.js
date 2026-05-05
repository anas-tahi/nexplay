const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null // URL or preset avatar name
  },
  bio: {
    type: String,
    maxlength: 200,
    default: ''
  },
  stats: {
    gamesPlayed: {
      type: Number,
      default: 0
    },
    totalScore: {
      type: Number,
      default: 0
    },
    multiplayerWins: {
      type: Number,
      default: 0
    },
    multiplayerLosses: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    bestStreak: {
      type: Number,
      default: 0
    }
  },
  gameStats: {
    snake: {
      highScore: { type: Number, default: 0 },
      gamesPlayed: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 }
    },
    memory: {
      highScore: { type: Number, default: 0 },
      gamesPlayed: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 }
    },
    tictactoe: {
      highScore: { type: Number, default: 0 },
      gamesPlayed: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      multiplayerWins: { type: Number, default: 0 },
      multiplayerLosses: { type: Number, default: 0 }
    },
    pong: {
      highScore: { type: Number, default: 0 },
      gamesPlayed: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 }
    },
    breakout: {
      highScore: { type: Number, default: 0 },
      gamesPlayed: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 }
    }
  },
  achievements: [{
    type: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    unlockedAt: {
      type: Date,
      default: Date.now
    }
  }],
  friends: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  friendRequests: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  }],
  preferences: {
    notifications: {
      friendRequests: { type: Boolean, default: true },
      gameInvites: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true }
    },
    privacy: {
      showOnlineStatus: { type: Boolean, default: true },
      allowFriendRequests: { type: Boolean, default: true }
    }
  },
  rank: {
    type: Number,
    default: 1000 // Starting ELO rating
  },
  level: {
    type: Number,
    default: 1
  },
  experience: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
profileSchema.index({ user: 1 });
profileSchema.index({ username: 1 });
profileSchema.index({ rank: -1 });

module.exports = mongoose.model('Profile', profileSchema);

const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  gameType: {
    type: String,
    required: true,
    enum: ['tictactoe', 'connectfour', 'checkers', 'snake', 'memory', 'pong', 'breakout']
  },
  type: {
    type: String,
    required: true,
    enum: ['ranked', 'casual', 'tournament']
  },
  status: {
    type: String,
    required: true,
    enum: ['registration', 'in-progress', 'completed', 'cancelled'],
    default: 'registration'
  },
  maxParticipants: {
    type: Number,
    required: true,
    min: 2,
    max: 64
  },
  entryFee: {
    type: Number,
    default: 0
  },
  prizePool: {
    type: Number,
    default: 0
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    currentElo: {
      type: Number,
      required: true
    }
  }],
  matches: [{
    round: {
      type: Number,
      required: true
    },
    matchNumber: {
      type: Number,
      required: true
    },
    player1: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      username: String,
      eloBefore: Number
    },
    player2: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      username: String,
      eloBefore: Number
    },
    winner: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      username: String
    },
    score: {
      player1: Number,
      player2: Number
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    scheduledAt: {
      type: Date
    },
    startedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    roomId: String
  }],
  results: [{
    position: {
      type: Number,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    eloChange: {
      type: Number,
      required: true
    },
    finalElo: {
      type: Number,
      required: true
    },
    prize: {
      type: Number,
      default: 0
    }
  }],
  rules: {
    timeLimit: {
      type: Number,
      default: 600 // 10 minutes per match
    },
    format: {
      type: String,
      enum: ['single-elimination', 'double-elimination', 'round-robin'],
      default: 'single-elimination'
    },
    eloRequired: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
tournamentSchema.index({ status: 1, startTime: 1 });
tournamentSchema.index({ gameType: 1, type: 1 });
tournamentSchema.index({ 'participants.user': 1 });

module.exports = mongoose.model('Tournament', tournamentSchema);

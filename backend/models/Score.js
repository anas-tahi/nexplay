const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  game: {
    type: String,
    required: true,
    enum: ['snake', 'memory', 'tictactoe', 'pong', 'breakout']
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  isGuest: {
    type: Boolean,
    default: false
  },
  guestUsername: {
    type: String,
    required: function() {
      return this.isGuest;
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient leaderboard queries
scoreSchema.index({ game: 1, score: -1 });

module.exports = mongoose.model('Score', scoreSchema);

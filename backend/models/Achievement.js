const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['score', 'streak', 'multiplayer', 'games', 'special']
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
  condition: {
    game: {
      type: String,
      enum: ['snake', 'memory', 'tictactoe', 'pong', 'breakout', 'any']
    },
    metric: {
      type: String,
      enum: ['highScore', 'gamesPlayed', 'wins', 'losses', 'streak', 'totalScore']
    },
    value: {
      type: Number,
      required: true
    }
  },
  points: {
    type: Number,
    default: 10
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Achievement', achievementSchema);

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  getUserStats,
  getLeaderboard
} = require('../controllers/profileController');

// Get user profile
router.get('/', authenticateToken, getProfile);

// Update user profile
router.put('/', authenticateToken, updateProfile);

// Get user stats
router.get('/stats', authenticateToken, getUserStats);

// Get leaderboard
router.get('/leaderboard', getLeaderboard);

module.exports = router;

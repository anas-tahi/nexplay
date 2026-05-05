const express = require('express');
const router = express.Router();
const { submitScore, getLeaderboard, getPersonalBest, getCompetitionData } = require('../controllers/scoreController');
const { authenticateToken } = require('../middleware/auth');

// Submit score (protected route)
router.post('/submit', authenticateToken, submitScore);

// Get global leaderboard for a game (public route)
router.get('/leaderboard/:game', getLeaderboard);

// Get user's personal best scores (protected route)
router.get('/personal-best', authenticateToken, getPersonalBest);

// Get comprehensive competition data (public route)
router.get('/competition', getCompetitionData);

module.exports = router;

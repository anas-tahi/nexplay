const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getEloLeaderboard,
  createTournament,
  getTournaments,
  joinTournament
} = require('../controllers/eloController');

// ELO leaderboard
router.get('/leaderboard', getEloLeaderboard);

// Tournament routes
router.post('/tournaments', authenticateToken, createTournament);
router.get('/tournaments', getTournaments);
router.post('/tournaments/:tournamentId/join', authenticateToken, joinTournament);

module.exports = router;

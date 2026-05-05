const Score = require('../models/Score');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { updateGameStats } = require('./profileController');

// Submit score
const submitScore = async (req, res) => {
  try {
    const { game, score } = req.body;
    const userId = req.user.userId;
    const isGuest = req.user.isGuest || false;

    // Validation
    if (!game || score === undefined) {
      return res.status(400).json({ message: 'Game and score are required' });
    }

    if (!['snake', 'memory', 'tictactoe', 'pong', 'breakout'].includes(game)) {
      return res.status(400).json({ message: 'Invalid game type' });
    }

    if (typeof score !== 'number' || score < 0) {
      return res.status(400).json({ message: 'Score must be a non-negative number' });
    }

    let scoreData = {
      game,
      score,
      isGuest
    };

    if (isGuest) {
      // For guest users, extract username from JWT token
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          // Guest users might have username in the token or we need to get it from request
          scoreData.guestUsername = req.body.username || `Guest_${userId.slice(-8)}`;
        } catch (error) {
          scoreData.guestUsername = `Guest_${userId.slice(-8)}`;
        }
      } else {
        scoreData.guestUsername = `Guest_${userId.slice(-8)}`;
      }
    } else {
      // For registered users, find the user and reference them
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      scoreData.user = userId;
    }

    // Create new score
    const newScore = new Score(scoreData);
    await newScore.save();

    // Update user profile stats (only for registered users)
    if (!isGuest) {
      await updateGameStats(userId, game, score);
    }

    res.status(201).json({
      message: 'Score submitted successfully',
      score: {
        id: newScore._id,
        game: newScore.game,
        score: newScore.score,
        createdAt: newScore.createdAt
      }
    });
  } catch (error) {
    console.error('Submit score error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get global leaderboard for a game
const getLeaderboard = async (req, res) => {
  try {
    const { game } = req.params;

    if (!['snake', 'memory', 'tictactoe', 'pong', 'breakout'].includes(game)) {
      return res.status(400).json({ message: 'Invalid game type' });
    }

    // Get top 10 scores for the game
    const leaderboard = await Score.find({ game })
      .sort({ score: -1 })
      .limit(10)
      .populate('user', 'username')
      .exec();

    // Format the response
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      username: entry.isGuest ? entry.guestUsername : (entry.user?.username || 'Unknown'),
      score: entry.score,
      isGuest: entry.isGuest,
      date: entry.createdAt
    }));

    res.json({
      game,
      leaderboard: formattedLeaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's personal best scores
const getPersonalBest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const isGuest = req.user.isGuest || false;

    let scores;
    
    if (isGuest) {
      // For guest users, get scores by guest username
      scores = await Score.find({ 
        isGuest: true, 
        guestUsername: req.user.username 
      });
    } else {
      // For registered users, get scores by user ID
      scores = await Score.find({ user: userId });
    }

    // Group by game and get best score for each game
    const personalBest = {};
    scores.forEach(score => {
      if (!personalBest[score.game] || score.score > personalBest[score.game].score) {
        personalBest[score.game] = {
          score: score.score,
          date: score.createdAt
        };
      }
    });

    res.json({
      personalBest
    });
  } catch (error) {
    console.error('Get personal best error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get comprehensive competition data
const getCompetitionData = async (req, res) => {
  try {
    const games = ['snake', 'memory', 'tictactoe', 'pong', 'breakout'];
    
    // Get all scores for each game
    const gameLeaderboards = {};
    const gameChampions = {};
    
    for (const game of games) {
      const leaderboard = await Score.find({ game })
        .sort({ score: -1 })
        .limit(10)
        .populate('user', 'username')
        .exec();
      
      gameLeaderboards[game] = leaderboard.map((entry, index) => ({
        rank: index + 1,
        username: entry.isGuest ? entry.guestUsername : (entry.user?.username || 'Unknown'),
        score: entry.score,
        isGuest: entry.isGuest,
        date: entry.createdAt
      }));
      
      if (leaderboard.length > 0) {
        gameChampions[game] = {
          username: leaderboard[0].isGuest ? leaderboard[0].guestUsername : (leaderboard[0].user?.username || 'Unknown'),
          score: leaderboard[0].score,
          isGuest: leaderboard[0].isGuest
        };
      }
    }

    // Get all users with their aggregated stats
    const allScores = await Score.find({})
      .populate('user', 'username')
      .exec();

    const playerStats = {};
    allScores.forEach(score => {
      const username = score.isGuest ? score.guestUsername : (score.user?.username || 'Unknown');
      const key = `${username}_${score.isGuest}`;
      
      if (!playerStats[key]) {
        playerStats[key] = {
          username,
          isGuest: score.isGuest,
          totalScore: 0,
          gamesPlayed: 0,
          highScore: 0,
          bestGame: null
        };
      }
      
      playerStats[key].totalScore += score.score;
      playerStats[key].gamesPlayed += 1;
      
      if (score.score > playerStats[key].highScore) {
        playerStats[key].highScore = score.score;
        playerStats[key].bestGame = score.game;
      }
    });

    // Convert to array and sort
    const allPlayers = Object.values(playerStats).sort((a, b) => b.totalScore - a.totalScore);
    const topPlayers = allPlayers.slice(0, 10);

    res.json({
      gameLeaderboards,
      gameChampions,
      allPlayers,
      topPlayers
    });
  } catch (error) {
    console.error('Get competition data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitScore,
  getLeaderboard,
  getPersonalBest,
  getCompetitionData
};

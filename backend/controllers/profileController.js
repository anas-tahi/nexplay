const Profile = require('../models/Profile');
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const Score = require('../models/Score');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const isGuest = req.user.isGuest || false;

    let profile;
    
    if (isGuest) {
      // For guest users, return a temporary profile
      const user = JSON.parse(req.user.username || '{}');
      profile = {
        username: user.username || 'Guest',
        isGuest: true,
        stats: {
          gamesPlayed: 0,
          totalScore: 0,
          multiplayerWins: 0,
          multiplayerLosses: 0,
          currentStreak: 0,
          bestStreak: 0
        },
        gameStats: {
          snake: { highScore: 0, gamesPlayed: 0, totalScore: 0 },
          memory: { highScore: 0, gamesPlayed: 0, totalScore: 0 },
          tictactoe: { highScore: 0, gamesPlayed: 0, totalScore: 0, multiplayerWins: 0, multiplayerLosses: 0 },
          pong: { highScore: 0, gamesPlayed: 0, totalScore: 0 },
          breakout: { highScore: 0, gamesPlayed: 0, totalScore: 0 }
        },
        achievements: [],
        rank: 1000,
        level: 1,
        experience: 0
      };
    } else {
      // For registered users, get full profile
      profile = await Profile.findOne({ user: userId })
        .populate('user', 'email createdAt')
        .populate('friends.user', 'username')
        .populate('friendRequests.from', 'username');
      
      if (!profile) {
        // Create profile if it doesn't exist
        const user = await User.findById(userId);
        profile = new Profile({
          user: userId,
          username: user.username
        });
        await profile.save();
      }
    }

    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const isGuest = req.user.isGuest || false;

    if (isGuest) {
      return res.status(403).json({ message: 'Guest users cannot update profiles' });
    }

    const { username, bio, avatar, preferences } = req.body;
    
    let profile = await Profile.findOne({ user: userId });
    
    if (!profile) {
      profile = new Profile({ user: userId });
    }

    // Update fields
    if (username) {
      // Check if username is already taken
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      // Update in both User and Profile
      await User.findByIdAndUpdate(userId, { username });
      profile.username = username;
    }
    
    if (bio !== undefined) profile.bio = bio;
    if (avatar !== undefined) profile.avatar = avatar;
    if (preferences) profile.preferences = { ...profile.preferences, ...preferences };

    await profile.save();
    
    res.json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user stats
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const isGuest = req.user.isGuest || false;

    if (isGuest) {
      return res.json({
        gamesPlayed: 0,
        totalScore: 0,
        multiplayerWins: 0,
        multiplayerLosses: 0,
        currentStreak: 0,
        bestStreak: 0,
        gameStats: {
          snake: { highScore: 0, gamesPlayed: 0 },
          memory: { highScore: 0, gamesPlayed: 0 },
          tictactoe: { highScore: 0, gamesPlayed: 0 },
          pong: { highScore: 0, gamesPlayed: 0 },
          breakout: { highScore: 0, gamesPlayed: 0 }
        }
      });
    }

    const profile = await Profile.findOne({ user: userId });
    
    if (!profile) {
      return res.json({
        gamesPlayed: 0,
        totalScore: 0,
        multiplayerWins: 0,
        multiplayerLosses: 0,
        currentStreak: 0,
        bestStreak: 0,
        gameStats: {
          snake: { highScore: 0, gamesPlayed: 0 },
          memory: { highScore: 0, gamesPlayed: 0 },
          tictactoe: { highScore: 0, gamesPlayed: 0 },
          pong: { highScore: 0, gamesPlayed: 0 },
          breakout: { highScore: 0, gamesPlayed: 0 }
        }
      });
    }

    res.json({
      gamesPlayed: profile.stats.gamesPlayed,
      totalScore: profile.stats.totalScore,
      multiplayerWins: profile.stats.multiplayerWins,
      multiplayerLosses: profile.stats.multiplayerLosses,
      currentStreak: profile.stats.currentStreak,
      bestStreak: profile.stats.bestStreak,
      gameStats: profile.gameStats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update game stats after score submission
const updateGameStats = async (userId, game, score, isMultiplayer = false, result = null) => {
  try {
    const profile = await Profile.findOne({ user: userId });
    
    if (!profile) {
      // Create profile if it doesn't exist
      const user = await User.findById(userId);
      profile = new Profile({ user: userId, username: user.username });
    }

    // Update overall stats
    profile.stats.gamesPlayed += 1;
    profile.stats.totalScore += score;

    // Update game-specific stats
    if (profile.gameStats[game]) {
      profile.gameStats[game].gamesPlayed += 1;
      profile.gameStats[game].totalScore += score;
      
      if (score > profile.gameStats[game].highScore) {
        profile.gameStats[game].highScore = score;
      }
    }

    // Update multiplayer stats
    if (isMultiplayer && result) {
      if (result === 'win') {
        profile.stats.multiplayerWins += 1;
        if (profile.gameStats[game].multiplayerWins !== undefined) {
          profile.gameStats[game].multiplayerWins += 1;
        }
      } else if (result === 'loss') {
        profile.stats.multiplayerLosses += 1;
        if (profile.gameStats[game].multiplayerLosses !== undefined) {
          profile.gameStats[game].multiplayerLosses += 1;
        }
      }
    }

    // Update streak
    if (result === 'win') {
      profile.stats.currentStreak += 1;
      if (profile.stats.currentStreak > profile.stats.bestStreak) {
        profile.stats.bestStreak = profile.stats.currentStreak;
      }
    } else if (result === 'loss') {
      profile.stats.currentStreak = 0;
    }

    // Add experience and check for level up
    profile.experience += Math.floor(score / 10);
    const experienceNeeded = profile.level * 100;
    if (profile.experience >= experienceNeeded) {
      profile.experience -= experienceNeeded;
      profile.level += 1;
    }

    await profile.save();
    
    // Check for new achievements
    await checkAchievements(userId, profile);
    
    return profile;
  } catch (error) {
    console.error('Update game stats error:', error);
    return null;
  }
};

// Check for new achievements
const checkAchievements = async (userId, profile) => {
  try {
    const achievements = await Achievement.find();
    const existingAchievementTypes = profile.achievements.map(a => a.type);
    
    for (const achievement of achievements) {
      if (existingAchievementTypes.includes(achievement.type)) {
        continue; // Already unlocked
      }

      let unlocked = false;
      const { condition } = achievement;

      if (condition.game === 'any' || condition.game === 'snake') {
        if (condition.metric === 'highScore' && profile.gameStats.snake.highScore >= condition.value) {
          unlocked = true;
        } else if (condition.metric === 'gamesPlayed' && profile.gameStats.snake.gamesPlayed >= condition.value) {
          unlocked = true;
        }
      }

      if (condition.game === 'any' || condition.game === 'memory') {
        if (condition.metric === 'highScore' && profile.gameStats.memory.highScore >= condition.value) {
          unlocked = true;
        } else if (condition.metric === 'gamesPlayed' && profile.gameStats.memory.gamesPlayed >= condition.value) {
          unlocked = true;
        }
      }

      if (condition.game === 'any' || condition.game === 'tictactoe') {
        if (condition.metric === 'wins' && profile.gameStats.tictactoe.multiplayerWins >= condition.value) {
          unlocked = true;
        }
      }

      if (condition.game === 'any') {
        if (condition.metric === 'totalScore' && profile.stats.totalScore >= condition.value) {
          unlocked = true;
        } else if (condition.metric === 'streak' && profile.stats.bestStreak >= condition.value) {
          unlocked = true;
        } else if (condition.metric === 'gamesPlayed' && profile.stats.gamesPlayed >= condition.value) {
          unlocked = true;
        }
      }

      if (unlocked) {
        profile.achievements.push({
          type: achievement.type,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          unlockedAt: new Date()
        });
      }
    }

    await profile.save();
  } catch (error) {
    console.error('Check achievements error:', error);
  }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { type = 'rank', game = 'all', limit = 50 } = req.query;
    
    let profiles;
    
    if (type === 'rank') {
      profiles = await Profile.find({})
        .sort({ rank: -1 })
        .limit(parseInt(limit))
        .populate('user', 'username');
    } else if (type === 'score' && game !== 'all') {
      profiles = await Profile.find({})
        .sort({ [`gameStats.${game}.highScore`]: -1 })
        .limit(parseInt(limit))
        .populate('user', 'username');
    } else if (type === 'totalScore') {
      profiles = await Profile.find({})
        .sort({ 'stats.totalScore': -1 })
        .limit(parseInt(limit))
        .populate('user', 'username');
    }

    const leaderboard = profiles.map((profile, index) => ({
      rank: index + 1,
      username: profile.username,
      avatar: profile.avatar,
      value: type === 'rank' ? profile.rank :
             type === 'score' && game !== 'all' ? profile.gameStats[game]?.highScore || 0 :
             profile.stats.totalScore,
      level: profile.level,
      achievements: profile.achievements.length
    }));

    res.json({
      type,
      game,
      leaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Initialize achievements
const initializeAchievements = async () => {
  try {
    const existingAchievements = await Achievement.countDocuments();
    
    if (existingAchievements === 0) {
      const achievements = [
        // Score achievements
        { type: 'first_score', name: 'First Steps', description: 'Score your first points', icon: '🎯', condition: { game: 'any', metric: 'totalScore', value: 10 }, points: 10, rarity: 'common' },
        { type: 'score_100', name: 'Century', description: 'Score 100 total points', icon: '💯', condition: { game: 'any', metric: 'totalScore', value: 100 }, points: 20, rarity: 'common' },
        { type: 'score_1000', name: 'Millennium', description: 'Score 1000 total points', icon: '🏆', condition: { game: 'any', metric: 'totalScore', value: 1000 }, points: 50, rarity: 'rare' },
        
        // Game-specific achievements
        { type: 'snake_50', name: 'Snake Master', description: 'Score 50 points in Snake', icon: '🐍', condition: { game: 'snake', metric: 'highScore', value: 50 }, points: 30, rarity: 'common' },
        { type: 'memory_500', name: 'Memory Genius', description: 'Score 500 points in Memory', icon: '🧠', condition: { game: 'memory', metric: 'highScore', value: 500 }, points: 40, rarity: 'rare' },
        { type: 'tictactoe_5_wins', name: 'TicTacToe Champion', description: 'Win 5 multiplayer TicTacToe games', icon: '⭕', condition: { game: 'tictactoe', metric: 'wins', value: 5 }, points: 35, rarity: 'rare' },
        
        // Streak achievements
        { type: 'streak_3', name: 'On Fire', description: 'Win 3 games in a row', icon: '🔥', condition: { game: 'any', metric: 'streak', value: 3 }, points: 25, rarity: 'common' },
        { type: 'streak_10', name: 'Unstoppable', description: 'Win 10 games in a row', icon: '⚡', condition: { game: 'any', metric: 'streak', value: 10 }, points: 60, rarity: 'epic' },
        
        // Games played achievements
        { type: 'games_10', name: 'Regular Player', description: 'Play 10 games', icon: '🎮', condition: { game: 'any', metric: 'gamesPlayed', value: 10 }, points: 15, rarity: 'common' },
        { type: 'games_100', name: 'Dedicated Gamer', description: 'Play 100 games', icon: '🎯', condition: { game: 'any', metric: 'gamesPlayed', value: 100 }, points: 45, rarity: 'rare' },
      ];

      await Achievement.insertMany(achievements);
      console.log('Achievements initialized successfully');
    }
  } catch (error) {
    console.error('Initialize achievements error:', error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUserStats,
  updateGameStats,
  getLeaderboard,
  initializeAchievements
};

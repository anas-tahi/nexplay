const Profile = require('../models/Profile');
const Tournament = require('../models/Tournament');

// ELO calculation constants
const K_FACTOR = 32;
const DEFAULT_ELO = 1000;

// Calculate expected score
const calculateExpectedScore = (elo1, elo2) => {
  return 1 / (1 + Math.pow(10, (elo2 - elo1) / 400));
};

// Update ELO ratings
const updateEloRatings = async (userId1, userId2, result) => {
  try {
    const profile1 = await Profile.findOne({ user: userId1 });
    const profile2 = await Profile.findOne({ user: userId2 });

    if (!profile1 || !profile2) {
      throw new Error('Profiles not found');
    }

    const elo1 = profile1.rank || DEFAULT_ELO;
    const elo2 = profile2.rank || DEFAULT_ELO;

    const expectedScore1 = calculateExpectedScore(elo1, elo2);
    const expectedScore2 = calculateExpectedScore(elo2, elo1);

    let score1, score2;
    if (result === 'win') {
      score1 = 1;
      score2 = 0;
    } else if (result === 'loss') {
      score1 = 0;
      score2 = 1;
    } else {
      score1 = 0.5;
      score2 = 0.5;
    }

    const newElo1 = Math.round(elo1 + K_FACTOR * (score1 - expectedScore1));
    const newElo2 = Math.round(elo2 + K_FACTOR * (score2 - expectedScore2));

    profile1.rank = newElo1;
    profile2.rank = newElo2;

    await profile1.save();
    await profile2.save();

    return {
      player1: { old: elo1, new: newElo1, change: newElo1 - elo1 },
      player2: { old: elo2, new: newElo2, change: newElo2 - elo2 }
    };
  } catch (error) {
    console.error('ELO update error:', error);
    throw error;
  }
};

// Get ELO leaderboard
const getEloLeaderboard = async (req, res) => {
  try {
    const { game = 'all', limit = 50 } = req.query;
    
    let query = {};
    if (game !== 'all') {
      query[`gameStats.${game}.multiplayerWins`] = { $gt: 0 };
    }

    const profiles = await Profile.find(query)
      .sort({ rank: -1 })
      .limit(parseInt(limit))
      .populate('user', 'username');

    const leaderboard = profiles.map((profile, index) => ({
      rank: index + 1,
      username: profile.username,
      elo: profile.rank,
      level: profile.level,
      multiplayerWins: profile.stats.multiplayerWins,
      multiplayerLosses: profile.stats.multiplayerLosses,
      winRate: profile.stats.multiplayerWins + profile.stats.multiplayerLosses > 0 
        ? Math.round((profile.stats.multiplayerWins / (profile.stats.multiplayerWins + profile.stats.multiplayerLosses)) * 100)
        : 0
    }));

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get ELO leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create tournament
const createTournament = async (req, res) => {
  try {
    const { name, gameType, type, maxParticipants, entryFee, startTime, rules } = req.body;
    const userId = req.user.userId;

    const tournament = new Tournament({
      name,
      gameType,
      type,
      maxParticipants,
      entryFee: entryFee || 0,
      startTime: new Date(startTime),
      prizePool: (entryFee || 0) * maxParticipants,
      rules: {
        ...rules,
        eloRequired: rules?.eloRequired || 0
      },
      createdBy: userId
    });

    await tournament.save();
    res.status(201).json({ tournament });
  } catch (error) {
    console.error('Create tournament error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get tournaments
const getTournaments = async (req, res) => {
  try {
    const { status = 'all', gameType = 'all' } = req.query;
    
    let query = {};
    if (status !== 'all') query.status = status;
    if (gameType !== 'all') query.gameType = gameType;

    const tournaments = await Tournament.find(query)
      .sort({ startTime: -1 })
      .populate('createdBy', 'username')
      .populate('participants.user', 'username')
      .limit(20);

    res.json({ tournaments });
  } catch (error) {
    console.error('Get tournaments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Join tournament
const joinTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const userId = req.user.userId;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.status !== 'registration') {
      return res.status(400).json({ message: 'Tournament registration is closed' });
    }

    if (tournament.participants.length >= tournament.maxParticipants) {
      return res.status(400).json({ message: 'Tournament is full' });
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (profile.rank < tournament.rules.eloRequired) {
      return res.status(400).json({ message: 'ELO rating too low for this tournament' });
    }

    const alreadyRegistered = tournament.participants.some(
      p => p.user.toString() === userId
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this tournament' });
    }

    tournament.participants.push({
      user: userId,
      username: profile.username,
      currentElo: profile.rank
    });

    await tournament.save();
    res.json({ message: 'Successfully joined tournament' });
  } catch (error) {
    console.error('Join tournament error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  updateEloRatings,
  getEloLeaderboard,
  createTournament,
  getTournaments,
  joinTournament
};

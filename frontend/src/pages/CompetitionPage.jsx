import { useState, useEffect } from 'react';
import axios from 'axios';

const CompetitionPage = () => {
  const [competitionData, setCompetitionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const games = ['snake', 'memory', 'tictactoe', 'pong', 'breakout'];

  useEffect(() => {
    fetchCompetitionData();
  }, []);

  const fetchCompetitionData = async () => {
    try {
      const response = await axios.get('/api/scores/competition');
      setCompetitionData(response.data);
    } catch (error) {
      console.error('Failed to fetch competition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getGameIcon = (game) => {
    const icons = {
      snake: '🐍',
      memory: '🧠',
      tictactoe: '⭕',
      pong: '🏓',
      breakout: '🧱'
    };
    return icons[game] || '🎮';
  };

  const getGameName = (game) => {
    return game.charAt(0).toUpperCase() + game.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading competition data...</p>
        </div>
      </div>
    );
  }

  if (!competitionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Failed to load competition data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-gamer neon-text mb-2">🏆 Competition</h1>
          <p className="text-gray-400">Compare scores across all games and see who dominates the leaderboard</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="glass-effect rounded-xl p-1 border border-white/10">
            {['overview', 'by-game', 'players'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-neon-pink to-neon-purple text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Top Players Overall */}
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold font-gamer neon-text mb-6">🏅 Top Players Overall</h2>
              <div className="space-y-3">
                {competitionData.topPlayers?.slice(0, 10).map((player, index) => (
                  <div key={player.username} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold font-gamer w-8">
                        {getRankIcon(index + 1)}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-lg">{player.username}</div>
                        <div className="text-sm text-gray-400">
                          {player.gamesPlayed} games • Total: {player.totalScore.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-neon-pink">{player.totalScore.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">Total Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Game Champions */}
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold font-gamer neon-text mb-6">🎯 Game Champions</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {games.map((game) => {
                  const champion = competitionData.gameChampions?.[game];
                  return (
                    <div key={game} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getGameIcon(game)}</span>
                          <span className="font-semibold text-white">{getGameName(game)}</span>
                        </div>
                        <span className="text-lg">👑</span>
                      </div>
                      {champion ? (
                        <div>
                          <div className="font-bold text-neon-green">{champion.username}</div>
                          <div className="text-sm text-gray-400">Score: {champion.score.toLocaleString()}</div>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">No scores yet</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* By Game Tab */}
        {activeTab === 'by-game' && (
          <div className="space-y-8">
            {games.map((game) => {
              const gameScores = competitionData.gameLeaderboards?.[game] || [];
              return (
                <div key={game} className="glass-effect rounded-xl p-6 border border-white/10">
                  <div className="flex items-center space-x-3 mb-6">
                    <span className="text-3xl">{getGameIcon(game)}</span>
                    <h2 className="text-2xl font-bold font-gamer neon-text">{getGameName(game)} Leaderboard</h2>
                  </div>
                  <div className="space-y-3">
                    {gameScores.slice(0, 10).map((entry, index) => (
                      <div key={`${entry.username}-${index}`} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-xl font-bold font-gamer w-8">
                            {getRankIcon(index + 1)}
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              {entry.username}
                              {entry.isGuest && (
                                <span className="ml-2 text-xs text-gray-400">(Guest)</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(entry.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-xl font-bold text-neon-pink">
                          {entry.score.toLocaleString()}
                        </div>
                      </div>
                    ))}
                    {gameScores.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        No scores yet for this game
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold font-gamer neon-text mb-6">👥 All Players</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 font-semibold text-gray-300">Rank</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-300">Player</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-300">Games</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-300">Total Score</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-300">Best Game</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-300">High Score</th>
                  </tr>
                </thead>
                <tbody>
                  {competitionData.allPlayers?.map((player, index) => (
                    <tr key={player.username} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold font-gamer text-neon-pink">
                          {getRankIcon(index + 1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">
                          {player.username}
                          {player.isGuest && (
                            <span className="ml-2 text-xs text-gray-400">(Guest)</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-300">
                        {player.gamesPlayed}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-neon-pink">
                          {player.totalScore.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <span>{getGameIcon(player.bestGame)}</span>
                          <span className="text-gray-300">{getGameName(player.bestGame)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-neon-green">
                          {player.highScore.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {competitionData.allPlayers?.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No players found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitionPage;

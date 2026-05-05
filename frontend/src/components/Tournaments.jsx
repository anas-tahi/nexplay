import { useState, useEffect } from 'react';
import axios from 'axios';
import useSocket from '../hooks/useSocket';
import { useNotifications } from './NotificationSystem';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [eloLeaderboard, setEloLeaderboard] = useState([]);
  
  const { connected } = useSocket();
  const { success, error } = useNotifications();

  const [newTournament, setNewTournament] = useState({
    name: '',
    gameType: 'tictactoe',
    type: 'ranked',
    maxParticipants: 8,
    entryFee: 0,
    startTime: '',
    rules: {
      timeLimit: 600,
      format: 'single-elimination',
      eloRequired: 0
    }
  });

  useEffect(() => {
    fetchTournaments();
    fetchEloLeaderboard();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await axios.get('/api/elo/tournaments', {
        params: { status: activeTab === 'all' ? undefined : activeTab }
      });
      setTournaments(response.data.tournaments);
    } catch (err) {
      console.error('Failed to fetch tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEloLeaderboard = async () => {
    try {
      const response = await axios.get('/api/elo/leaderboard?limit=10');
      setEloLeaderboard(response.data.leaderboard);
    } catch (err) {
      console.error('Failed to fetch ELO leaderboard:', err);
    }
  };

  const handleCreateTournament = async () => {
    if (!newTournament.name || !newTournament.startTime) {
      error('Error', 'Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/elo/tournaments', newTournament, {
        headers: { Authorization: `Bearer ${token}` }
      });

      success('Success', 'Tournament created successfully!');
      setShowCreateModal(false);
      setNewTournament({
        name: '',
        gameType: 'tictactoe',
        type: 'ranked',
        maxParticipants: 8,
        entryFee: 0,
        startTime: '',
        rules: {
          timeLimit: 600,
          format: 'single-elimination',
          eloRequired: 0
        }
      });
      fetchTournaments();
    } catch (err) {
      console.error('Failed to create tournament:', err);
      error('Error', 'Failed to create tournament');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinTournament = async (tournamentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/elo/tournaments/${tournamentId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      success('Success', 'Successfully joined tournament!');
      fetchTournaments();
    } catch (err) {
      console.error('Failed to join tournament:', err);
      error('Error', err.response?.data?.message || 'Failed to join tournament');
    }
  };

  const getGameIcon = (gameType) => {
    switch (gameType) {
      case 'tictactoe': return '⭕';
      case 'connectfour': return '🔴';
      case 'checkers': return '♟️';
      case 'snake': return '🐍';
      case 'memory': return '🧠';
      case 'pong': return '🏓';
      case 'breakout': return '🧱';
      default: return '🎮';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'registration': return 'text-blue-400';
      case 'in-progress': return 'text-yellow-400';
      case 'completed': return 'text-green-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'ranked': return 'text-purple-400';
      case 'casual': return 'text-green-400';
      case 'tournament': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="glass-effect rounded-xl p-6 border border-white/10">
        <div className="text-center py-8">
          <div className="w-16 h-16 border-4 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading tournaments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tournaments Section */}
      <div className="glass-effect rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-gamer neon-text">🏆 Tournaments</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink text-white font-bold rounded-lg transition-all duration-300"
          >
            Create Tournament
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-4">
          {['all', 'registration', 'in-progress', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                fetchTournaments();
              }}
              className={`flex-1 px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                activeTab === tab
                  ? 'text-neon-pink border-b-2 border-neon-pink'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Tournament List */}
        <div className="space-y-3">
          {tournaments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🏆</div>
              <p className="text-gray-400 text-sm">No tournaments found</p>
              <p className="text-gray-500 text-xs mt-1">Create one or change the filter</p>
            </div>
          ) : (
            tournaments.map((tournament) => (
              <div key={tournament._id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getGameIcon(tournament.gameType)}</span>
                      <div>
                        <h4 className="font-semibold text-white">{tournament.name}</h4>
                        <div className="flex items-center space-x-3 text-xs">
                          <span className={getStatusColor(tournament.status)}>
                            {tournament.status.replace('-', ' ')}
                          </span>
                          <span className={getTypeColor(tournament.type)}>
                            {tournament.type}
                          </span>
                          <span className="text-gray-400">
                            {tournament.participants.length}/{tournament.maxParticipants} players
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mt-3">
                      <div>
                        <span className="text-gray-500">Start:</span> {new Date(tournament.startTime).toLocaleString()}
                      </div>
                      <div>
                        <span className="text-gray-500">Entry:</span> {tournament.entryFee > 0 ? `${tournament.entryFee} coins` : 'Free'}
                      </div>
                      <div>
                        <span className="text-gray-500">Format:</span> {tournament.rules.format.replace('-', ' ')}
                      </div>
                      <div>
                        <span className="text-gray-500">Min ELO:</span> {tournament.rules.eloRequired}
                      </div>
                    </div>

                    {tournament.prizePool > 0 && (
                      <div className="mt-2 text-sm">
                        <span className="text-neon-pink font-semibold">Prize Pool: {tournament.prizePool} coins</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    {tournament.status === 'registration' && tournament.participants.length < tournament.maxParticipants && (
                      <button
                        onClick={() => handleJoinTournament(tournament._id)}
                        className="px-3 py-1 bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-blue hover:to-neon-green text-white text-xs font-bold rounded"
                      >
                        Join
                      </button>
                    )}
                    {tournament.status === 'in-progress' && (
                      <button
                        className="px-3 py-1 bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink text-white text-xs font-bold rounded"
                      >
                        Watch
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ELO Leaderboard */}
      <div className="glass-effect rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold font-gamer neon-text mb-4">🏅 ELO Rankings</h3>
        
        {eloLeaderboard.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🏅</div>
            <p className="text-gray-400 text-sm">No ranked players yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {eloLeaderboard.map((player, index) => (
              <div key={player.username} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-lg font-bold text-neon-pink w-6">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{player.username}</div>
                    <div className="text-xs text-gray-400">
                      Level {player.level} • {player.multiplayerWins}W/{player.multiplayerLosses}L
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-neon-green">{player.elo}</div>
                  <div className="text-xs text-gray-400">{player.winRate}% WR</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Tournament Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-xl p-6 border border-white/10 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold font-gamer neon-text mb-4">Create Tournament</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tournament Name</label>
                <input
                  type="text"
                  value={newTournament.name}
                  onChange={(e) => setNewTournament({...newTournament, name: e.target.value})}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-neon-pink"
                  placeholder="Enter tournament name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Game</label>
                  <select
                    value={newTournament.gameType}
                    onChange={(e) => setNewTournament({...newTournament, gameType: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white focus:outline-none focus:border-neon-pink"
                  >
                    <option value="tictactoe">Tic Tac Toe</option>
                    <option value="connectfour">Connect Four</option>
                    <option value="checkers">Checkers</option>
                    <option value="snake">Snake</option>
                    <option value="memory">Memory</option>
                    <option value="pong">Pong</option>
                    <option value="breakout">Breakout</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                  <select
                    value={newTournament.type}
                    onChange={(e) => setNewTournament({...newTournament, type: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white focus:outline-none focus:border-neon-pink"
                  >
                    <option value="casual">Casual</option>
                    <option value="ranked">Ranked</option>
                    <option value="tournament">Tournament</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Players</label>
                  <select
                    value={newTournament.maxParticipants}
                    onChange={(e) => setNewTournament({...newTournament, maxParticipants: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white focus:outline-none focus:border-neon-pink"
                  >
                    <option value={4}>4 Players</option>
                    <option value={8}>8 Players</option>
                    <option value={16}>16 Players</option>
                    <option value={32}>32 Players</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Entry Fee</label>
                  <input
                    type="number"
                    value={newTournament.entryFee}
                    onChange={(e) => setNewTournament({...newTournament, entryFee: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-neon-pink"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  value={newTournament.startTime}
                  onChange={(e) => setNewTournament({...newTournament, startTime: e.target.value})}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-neon-pink"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
                  <select
                    value={newTournament.rules.format}
                    onChange={(e) => setNewTournament({
                      ...newTournament, 
                      rules: {...newTournament.rules, format: e.target.value}
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white focus:outline-none focus:border-neon-pink"
                  >
                    <option value="single-elimination">Single Elimination</option>
                    <option value="double-elimination">Double Elimination</option>
                    <option value="round-robin">Round Robin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Min ELO</label>
                  <input
                    type="number"
                    value={newTournament.rules.eloRequired}
                    onChange={(e) => setNewTournament({
                      ...newTournament, 
                      rules: {...newTournament.rules, eloRequired: parseInt(e.target.value)}
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-neon-pink"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateTournament}
                disabled={creating}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-blue hover:to-neon-green text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Tournament'}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 glass-effect hover:bg-white/10 text-white font-bold rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tournaments;

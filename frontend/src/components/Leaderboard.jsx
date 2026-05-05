import { useState, useEffect } from 'react';
import axios from 'axios';

const Leaderboard = ({ game }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(`/api/scores/leaderboard/${game}`);
        setLeaderboard(response.data.leaderboard);
      } catch (err) {
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [game]);

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  if (loading) {
    return (
      <div className="glass-effect rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold font-gamer mb-4 neon-text">Leaderboard</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading scores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-effect rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold font-gamer mb-4 neon-text">Leaderboard</h3>
        <div className="text-center py-8">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-xl p-6 border border-white/10">
      <h3 className="text-xl font-bold font-gamer mb-4 neon-text">🏆 Leaderboard</h3>
      
      {leaderboard.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No scores yet. Be the first to play!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div 
              key={entry.rank}
              className={`flex items-center justify-between p-3 rounded-lg ${
                entry.rank === 1 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' :
                entry.rank === 2 ? 'bg-gradient-to-r from-gray-500/20 to-gray-400/20 border border-gray-400/30' :
                entry.rank === 3 ? 'bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-600/30' :
                'bg-white/5'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl font-bold font-gamer">
                  {getRankIcon(entry.rank)}
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
        </div>
      )}
    </div>
  );
};

export default Leaderboard;

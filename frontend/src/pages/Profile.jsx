import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSocket from '../hooks/useSocket';
import axios from 'axios';
import FriendsList from '../components/FriendsList';
import Tournaments from '../components/Tournaments';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    avatar: '',
    preferences: {
      notifications: {
        friendRequests: true,
        gameInvites: true,
        messages: true,
        achievements: true
      },
      privacy: {
        showOnlineStatus: true,
        allowFriendRequests: true
      }
    }
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [leaderboard, setLeaderboard] = useState([]);

  const { connected, onlineUsers } = useSocket();

  useEffect(() => {
    fetchProfile();
    fetchLeaderboard();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setEditForm({
        username: response.data.username,
        bio: response.data.bio || '',
        avatar: response.data.avatar || '',
        preferences: response.data.preferences || editForm.preferences
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('/api/profile/leaderboard?type=rank&limit=10');
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const handleEditProfile = () => {
    setEditing(true);
  };

  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const handleSaveProfile = async () => {
    setEditError('');
    setEditSuccess('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/profile', editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data.profile);

      // Update localStorage user so Navbar syncs immediately
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (editForm.username) {
        savedUser.username = editForm.username;
        localStorage.setItem('user', JSON.stringify(savedUser));
        window.dispatchEvent(new Event('auth-change'));
      }

      setEditSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setEditError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditForm({
        username: profile.username,
        bio: profile.bio || '',
        avatar: profile.avatar || '',
        preferences: profile.preferences || editForm.preferences
      });
    }
    setEditing(false);
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    return `/avatars/${avatar}`;
  };

  const getLevelProgress = (experience, level) => {
    const experienceNeeded = level * 100;
    const progress = (experience / experienceNeeded) * 100;
    return Math.min(progress, 100);
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Profile not found</p>
          <Link to="/" className="text-neon-pink hover:text-neon-blue">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-neon-pink hover:text-neon-blue transition-colors duration-200 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold font-gamer neon-text mb-2">Player Profile</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="relative">
                    {profile.avatar ? (
                      <img 
                        src={getAvatarUrl(profile.avatar)} 
                        alt={profile.username}
                        className="w-20 h-20 rounded-full border-2 border-neon-pink"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-r from-neon-pink to-neon-purple rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {profile.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {connected && (
                      <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-primary-200" />
                    )}
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-white">{profile.username}</h2>
                    {profile.isGuest && (
                      <span className="text-sm text-gray-400">(Guest)</span>
                    )}
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="text-sm text-gray-400">
                        Level {profile.level}
                      </div>
                      <div className="text-sm text-gray-400">
                        Rank #{profile.rank}
                      </div>
                      <div className="text-sm text-gray-400">
                        {profile.achievements?.length || 0} Achievements
                      </div>
                    </div>
                  </div>
                </div>

                {!profile.isGuest && (
                  <button
                    onClick={editing ? handleCancelEdit : handleEditProfile}
                    className="px-4 py-2 bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink text-white font-bold rounded-lg transition-all duration-300"
                  >
                    {editing ? 'Cancel' : 'Edit Profile'}
                  </button>
                )}
              </div>

              {/* Level Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Level {profile.level}</span>
                  <span className="text-gray-400">{profile.experience}/{profile.level * 100} XP</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-neon-green to-neon-blue h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getLevelProgress(profile.experience, profile.level)}%` }}
                  />
                </div>
              </div>

              {/* Edit Form */}
              {editing && !profile.isGuest && (
                <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  {editError && (
                    <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
                      {editError}
                    </div>
                  )}
                  {editSuccess && (
                    <div className="p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-300 text-sm">
                      {editSuccess}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                      minLength={3}
                      maxLength={20}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-neon-pink"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Avatar URL</label>
                    <input
                      type="url"
                      value={editForm.avatar}
                      onChange={(e) => setEditForm({...editForm, avatar: e.target.value})}
                      placeholder="https://example.com/avatar.png"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-neon-pink"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty to use default avatar</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bio <span className="text-gray-500">({editForm.bio.length}/200)</span>
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      maxLength={200}
                      rows={3}
                      placeholder="Tell others about yourself..."
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-neon-pink"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-blue hover:to-neon-green text-white font-bold rounded-lg transition-all duration-300"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 glass-effect hover:bg-white/10 text-white font-bold rounded-lg transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Bio */}
              {!editing && profile.bio && (
                <div className="text-gray-300 italic">
                  "{profile.bio}"
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="glass-effect rounded-xl border border-white/10">
              <div className="flex border-b border-white/10">
                {['overview', 'stats', 'achievements', 'tournaments'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
                      activeTab === tab
                        ? 'text-neon-pink border-b-2 border-neon-pink'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-neon-pink">{profile.stats?.gamesPlayed || 0}</div>
                        <div className="text-sm text-gray-400">Games Played</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-neon-green">{profile.stats?.totalScore || 0}</div>
                        <div className="text-sm text-gray-400">Total Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-neon-blue">{profile.stats?.multiplayerWins || 0}</div>
                        <div className="text-sm text-gray-400">Multiplayer Wins</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-neon-purple">{profile.stats?.bestStreak || 0}</div>
                        <div className="text-sm text-gray-400">Best Streak</div>
                      </div>
                    </div>

                    {/* Game Stats */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Game Performance</h3>
                      <div className="space-y-3">
                        {Object.entries(profile.gameStats || {}).map(([game, stats]) => (
                          <div key={game} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">
                                {game === 'snake' ? '🐍' : 
                                 game === 'memory' ? '🧠' : 
                                 game === 'tictactoe' ? '⭕' : 
                                 game === 'pong' ? '🏓' : '🧱'}
                              </div>
                              <div>
                                <div className="font-semibold text-white capitalize">{game}</div>
                                <div className="text-sm text-gray-400">
                                  {stats.gamesPlayed} games • High Score: {stats.highScore}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-neon-pink">{stats.highScore}</div>
                              <div className="text-xs text-gray-400">High Score</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Stats Tab */}
                {activeTab === 'stats' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">Performance Statistics</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-md font-semibold text-neon-pink">Overall Stats</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total Games</span>
                            <span className="text-white font-semibold">{profile.stats?.gamesPlayed || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total Score</span>
                            <span className="text-white font-semibold">{profile.stats?.totalScore || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Current Streak</span>
                            <span className="text-white font-semibold">{profile.stats?.currentStreak || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Best Streak</span>
                            <span className="text-white font-semibold">{profile.stats?.bestStreak || 0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-md font-semibold text-neon-blue">Multiplayer Stats</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Wins</span>
                            <span className="text-white font-semibold">{profile.stats?.multiplayerWins || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Losses</span>
                            <span className="text-white font-semibold">{profile.stats?.multiplayerLosses || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Win Rate</span>
                            <span className="text-white font-semibold">
                              {profile.stats?.multiplayerWins + profile.stats?.multiplayerLosses > 0
                                ? Math.round((profile.stats.multiplayerWins / (profile.stats.multiplayerWins + profile.stats.multiplayerLosses)) * 100)
                                : 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tournaments Tab */}
                {activeTab === 'tournaments' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">Tournaments & Rankings</h3>
                    
                    <Tournaments />
                  </div>
                )}

                {/* Achievements Tab */}
                {activeTab === 'achievements' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">Achievements</h3>
                    
                    {profile.achievements?.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">🏆</div>
                        <p className="text-gray-400">No achievements yet. Keep playing to unlock them!</p>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {profile.achievements.map((achievement, index) => (
                          <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-start space-x-3">
                              <div className="text-2xl">{achievement.icon}</div>
                              <div className="flex-1">
                                <div className="font-semibold text-white">{achievement.name}</div>
                                <div className="text-sm text-gray-400">{achievement.description}</div>
                                <div className="flex items-center justify-between mt-2">
                                  <span className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                                    {achievement.rarity?.toUpperCase()}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Friends List */}
            {!profile.isGuest && <FriendsList />}

            {/* Leaderboard */}
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-bold font-gamer mb-4 neon-text">🏆 Top Players</h3>
              
              {leaderboard.length === 0 ? (
                <p className="text-gray-400 text-sm text-center">No players ranked yet</p>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((player, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="text-lg font-bold text-neon-pink w-6">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white text-sm">{player.username}</div>
                        <div className="text-xs text-gray-400">Level {player.level}</div>
                      </div>
                      <div className="text-sm font-bold text-neon-green">
                        {player.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Online Status */}
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-bold font-gamer mb-4 neon-text">🌐 Platform Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Online Users</span>
                  <span className="text-white font-semibold">{onlineUsers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Connection</span>
                  <span className={`font-semibold ${connected ? 'text-green-400' : 'text-red-400'}`}>
                    {connected ? 'Connected' : 'Offline'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Your Rank</span>
                  <span className="text-white font-semibold">#{profile.rank}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

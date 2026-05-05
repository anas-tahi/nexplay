import { useState, useEffect } from 'react';
import axios from 'axios';
import useSocket from '../hooks/useSocket';

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('friends');

  const { onlineUsers } = useSocket();

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
  }, []);

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/friends', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update online status
      const friendsWithStatus = response.data.friends.map(friend => ({
        ...friend,
        online: onlineUsers.some(user => user.username === friend.username)
      }));
      
      setFriends(friendsWithStatus);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/friends/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFriendRequests(response.data.requests);
    } catch (error) {
      console.error('Failed to fetch friend requests:', error);
    }
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/friends/search?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data.users);
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (userId, username) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/friends/request', { toUsername: username }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update search results
      setSearchResults(prev => prev.map(user => 
        user.id === userId ? { ...user, requestSent: true } : user
      ));
      
      alert('Friend request sent!');
    } catch (error) {
      console.error('Failed to send friend request:', error);
      alert(error.response?.data?.message || 'Failed to send friend request');
    }
  };

  const handleRespondToRequest = async (requestId, action) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/friends/requests/${requestId}`, { action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update UI
      if (action === 'accept') {
        fetchFriends();
      }
      fetchFriendRequests();
    } catch (error) {
      console.error('Failed to respond to friend request:', error);
      alert('Failed to process request');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/friends/${friendId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFriends(prev => prev.filter(friend => friend.id !== friendId));
    } catch (error) {
      console.error('Failed to remove friend:', error);
      alert('Failed to remove friend');
    }
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    return `/avatars/${avatar}`;
  };

  return (
    <div className="glass-effect rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold font-gamer neon-text">👥 Friends</h3>
        <button
          onClick={() => setShowAddFriend(!showAddFriend)}
          className="px-4 py-2 bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink text-white font-bold rounded-lg transition-all duration-300 text-sm"
        >
          Add Friend
        </button>
      </div>

      {/* Add Friend Section */}
      {showAddFriend && (
        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex space-x-2 mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username..."
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 text-sm focus:outline-none focus:border-neon-pink"
              onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers()}
            />
            <button
              onClick={handleSearchUsers}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-blue hover:to-neon-green text-white font-bold rounded-lg text-sm disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {searchResults.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-neon-pink to-neon-purple rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-white text-sm">{user.username}</span>
                  </div>
                  <button
                    onClick={() => handleSendFriendRequest(user.id, user.username)}
                    disabled={user.isFriend || user.requestSent}
                    className="px-3 py-1 bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-blue hover:to-neon-green text-white text-xs font-bold rounded disabled:opacity-50"
                  >
                    {user.isFriend ? 'Friends' : user.requestSent ? 'Sent' : 'Add'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-4">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
            activeTab === 'friends'
              ? 'text-neon-pink border-b-2 border-neon-pink'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Friends ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
            activeTab === 'requests'
              ? 'text-neon-pink border-b-2 border-neon-pink'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Requests ({friendRequests.length})
        </button>
      </div>

      {/* Friends List */}
      {activeTab === 'friends' && (
        <div className="space-y-3">
          {friends.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-gray-400 text-sm">No friends yet</p>
              <p className="text-gray-500 text-xs mt-1">Add friends to see them here!</p>
            </div>
          ) : (
            friends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {friend.avatar ? (
                      <img 
                        src={getAvatarUrl(friend.avatar)} 
                        alt={friend.username}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-r from-neon-pink to-neon-purple rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {friend.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-primary-200 ${
                      friend.online ? 'bg-green-500' : 'bg-gray-500'
                    }`} />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{friend.username}</div>
                    <div className="text-xs text-gray-400">
                      {friend.online ? 'Online' : 'Offline'} • Added {new Date(friend.addedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 glass-effect hover:bg-white/10 rounded-lg transition-colors duration-200"
                    title="Send Message"
                  >
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                  <button
                    className="p-2 glass-effect hover:bg-white/10 rounded-lg transition-colors duration-200"
                    title="Invite to Game"
                  >
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleRemoveFriend(friend.id)}
                    className="p-2 glass-effect hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                    title="Remove Friend"
                  >
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Friend Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-3">
          {friendRequests.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📬</div>
              <p className="text-gray-400 text-sm">No friend requests</p>
            </div>
          ) : (
            friendRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-neon-pink to-neon-purple rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {request.from.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{request.from.username}</div>
                    <div className="text-xs text-gray-400">
                      Sent {new Date(request.sentAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRespondToRequest(request.id, 'accept')}
                    className="px-3 py-1 bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-blue hover:to-neon-green text-white text-xs font-bold rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespondToRequest(request.id, 'decline')}
                    className="px-3 py-1 glass-effect hover:bg-red-500/20 text-white text-xs font-bold rounded"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FriendsList;

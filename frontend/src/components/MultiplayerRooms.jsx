import { useState, useEffect } from 'react';
import useSocket from '../hooks/useSocket';
import axios from 'axios';

const MultiplayerRooms = () => {
  const [activeRooms, setActiveRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState(null);
  
  const {
    connected,
    createRoom,
    joinRoom,
    sendGameMove,
    sendGameOver,
    sendRoomMessage
  } = useSocket();

  useEffect(() => {
    fetchActiveRooms();
  }, []);

  const fetchActiveRooms = async () => {
    try {
      const response = await axios.get('/api/active-rooms');
      setActiveRooms(response.data);
    } catch (error) {
      console.error('Failed to fetch active rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (gameType) => {
    if (!connected) return;
    
    setCreatingRoom(true);
    try {
      const room = await createRoom(gameType);
      // Navigate to the game room
      window.location.href = `/multiplayer/${room.id}`;
    } catch (error) {
      console.error('Failed to create room:', error);
      alert('Failed to create room');
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleJoinRoom = async (roomId) => {
    if (!connected) return;
    
    setJoiningRoom(roomId);
    try {
      const room = await joinRoom(roomId);
      // Navigate to the game room
      window.location.href = `/multiplayer/${roomId}`;
    } catch (error) {
      console.error('Failed to join room:', error);
      alert(error.message || 'Failed to join room');
    } finally {
      setJoiningRoom(null);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getGameIcon = (gameType) => {
    switch (gameType) {
      case 'tictactoe': return '⭕';
      case 'snake': return '🐍';
      case 'memory': return '🧠';
      case 'pong': return '🏓';
      case 'breakout': return '🧱';
      default: return '🎮';
    }
  };

  const getGameName = (gameType) => {
    switch (gameType) {
      case 'tictactoe': return 'Tic Tac Toe';
      case 'snake': return 'Snake';
      case 'memory': return 'Memory';
      case 'pong': return 'Pong';
      case 'breakout': return 'Breakout';
      default: return gameType;
    }
  };

  if (loading) {
    return (
      <div className="glass-effect rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold font-gamer mb-4 neon-text">Multiplayer Rooms</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold font-gamer neon-text">🎮 Multiplayer Rooms</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-400">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Create Room Section */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-3">Create New Room</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['tictactoe', 'snake', 'memory', 'pong', 'breakout'].map((gameType) => (
            <button
              key={gameType}
              onClick={() => handleCreateRoom(gameType)}
              disabled={!connected || creatingRoom}
              className="p-3 bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-2xl mb-1">{getGameIcon(gameType)}</div>
              <div className="text-sm font-semibold">{getGameName(gameType)}</div>
              <div className="text-xs opacity-80">Create Room</div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Rooms */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-3">
          Active Rooms ({activeRooms.length})
        </h4>
        
        {activeRooms.length === 0 ? (
          <div className="text-center py-8 bg-white/5 rounded-lg border border-white/10">
            <div className="text-4xl mb-2">🎮</div>
            <p className="text-gray-400">No active rooms</p>
            <p className="text-sm text-gray-500 mt-1">Be the first to create a room!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeRooms.map((room) => (
              <div 
                key={room.id}
                className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getGameIcon(room.gameType)}</div>
                    <div>
                      <div className="font-semibold text-white">
                        {getGameName(room.gameType)}
                      </div>
                      <div className="text-sm text-gray-400">
                        Room: {room.id}
                      </div>
                      <div className="text-xs text-gray-500">
                        Host: {room.host.username}
                        {room.host.isGuest && (
                          <span className="ml-1">(Guest)</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`px-2 py-1 rounded text-xs font-semibold ${
                        room.gameState === 'waiting' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {room.gameState === 'waiting' ? 'Waiting' : 'Playing'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {room.playerCount}/2 players
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleJoinRoom(room.id)}
                      disabled={!connected || 
                               room.gameState === 'playing' || 
                               room.playerCount >= 2 ||
                               joiningRoom === room.id}
                      className="px-4 py-2 bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-blue hover:to-neon-green disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-all duration-300"
                    >
                      {joiningRoom === room.id ? 'Joining...' : 
                       room.gameState === 'playing' ? 'In Progress' :
                       room.playerCount >= 2 ? 'Full' : 'Join Room'}
                    </button>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  Created {formatTime(room.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!connected && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-300 text-sm">
            Connection lost. Please refresh the page to reconnect.
          </p>
        </div>
      )}
    </div>
  );
};

export default MultiplayerRooms;

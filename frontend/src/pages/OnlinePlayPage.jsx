import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSocket from '../hooks/useSocket';
import axios from 'axios';

const OnlinePlayPage = () => {
  const [activeTab, setActiveTab] = useState('rooms');
  const [rooms, setRooms] = useState([]);
  const [gameType, setGameType] = useState('tictactoe');
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState('');
  const { connected, onlineUsers } = useSocket();
  const [socket, setSocket] = useState(null);

  const games = [
    { key: 'tictactoe', label: 'Tic-Tac-Toe', icon: '⭕', maxPlayers: 2 },
    { key: 'memory', label: 'Memory', icon: '🧠', maxPlayers: 2 },
    { key: 'snake', label: 'Snake', icon: '🐍', maxPlayers: 1 },
    { key: 'pong', label: 'Pong', icon: '🏓', maxPlayers: 2 },
    { key: 'breakout', label: 'Breakout', icon: '🧱', maxPlayers: 1 }
  ];

  useEffect(() => {
    // Initialize socket connection
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (window.io) {
      const socketInstance = window.io(process.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token,
          username: user.username
        }
      });
      
      setSocket(socketInstance);

      // Listen for room updates
      socketInstance.on('room-created', (room) => {
        setRooms(prev => [room, ...prev]);
      });

      socketInstance.on('room-updated', (room) => {
        setRooms(prev => prev.map(r => r.id === room.id ? room : r));
      });

      socketInstance.on('room-list', (roomList) => {
        setRooms(roomList);
      });

      // Request initial room list
      socketInstance.emit('get-rooms');
    }

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  const createRoom = async () => {
    if (!socket || creatingRoom) return;
    
    setCreatingRoom(true);
    socket.emit('create-room', gameType);
    
    // Listen for room creation response
    socket.once('room-created', (room) => {
      setCreatingRoom(false);
      // Navigate to game room
      window.location.href = `/online-game/${room.id}`;
    });
  };

  const joinRoom = async (roomId) => {
    if (!socket || joiningRoom) return;
    
    setJoiningRoom(roomId);
    socket.emit('join-room', roomId);
    
    // Listen for room join response
    socket.once('room-joined', (room) => {
      setJoiningRoom('');
      // Navigate to game room
      window.location.href = `/online-game/${room.id}`;
    });

    socket.once('room-error', (error) => {
      setJoiningRoom('');
      alert(error);
    });
  };

  const getGameIcon = (gameKey) => {
    const game = games.find(g => g.key === gameKey);
    return game ? game.icon : '🎮';
  };

  const getGameName = (gameKey) => {
    const game = games.find(g => g.key === gameKey);
    return game ? game.label : 'Unknown';
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-gamer neon-text mb-2">🌐 Online Play</h1>
          <p className="text-gray-400">Challenge other players in real-time multiplayer games</p>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {connected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
            <span className="text-gray-400">
              {onlineUsers.length} players online
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="glass-effect rounded-xl p-1 border border-white/10">
            {['rooms', 'create'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-neon-pink to-neon-purple text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'rooms' ? '🎮 Game Rooms' : '➕ Create Room'}
              </button>
            ))}
          </div>
        </div>

        {/* Game Rooms Tab */}
        {activeTab === 'rooms' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {games.map((game) => (
                <button
                  key={game.key}
                  onClick={() => setGameType(game.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    gameType === game.key
                      ? 'bg-gradient-to-r from-neon-pink to-neon-purple text-white'
                      : 'glass-effect hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <span className="mr-2">{game.icon}</span>
                  {game.label}
                </button>
              ))}
            </div>

            {/* Rooms List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms
                .filter(room => gameType === 'all' || room.gameType === gameType)
                .map((room) => (
                  <div key={room.id} className="glass-effect rounded-xl p-4 border border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getGameIcon(room.gameType)}</span>
                          <span className="font-bold text-white">{getGameName(room.gameType)}</span>
                        </div>
                        <div className="text-sm text-gray-400">
                          Room ID: {room.id}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        room.gameState === 'waiting' 
                          ? 'bg-yellow-500/20 text-yellow-400' 
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {room.gameState === 'waiting' ? '⏳ Waiting' : '🎮 Playing'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-neon-purple to-neon-green rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">
                            {room.host.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-white">{room.host.username}</div>
                          <div className="text-xs text-gray-400">Host</div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-300">
                        Players: {room.players.length}/{games.find(g => g.key === room.gameType)?.maxPlayers || 2}
                      </div>

                      <button
                        onClick={() => joinRoom(room.id)}
                        disabled={joiningRoom === room.id || room.gameState === 'playing'}
                        className={`w-full px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                          joiningRoom === room.id
                            ? 'opacity-50 cursor-not-allowed'
                            : room.gameState === 'playing'
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-blue hover:to-neon-green text-white'
                        }`}
                      >
                        {joiningRoom === room.id ? 'Joining...' : 
                         room.gameState === 'playing' ? 'In Progress' : 'Join Room'}
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {rooms.filter(room => gameType === 'all' || room.gameType === gameType).length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎮</div>
                <p className="text-gray-400 text-lg">No active rooms found</p>
                <p className="text-gray-500 text-sm mt-2">Create a room to start playing!</p>
              </div>
            )}
          </div>
        )}

        {/* Create Room Tab */}
        {activeTab === 'create' && (
          <div className="max-w-md mx-auto">
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold font-gamer neon-text mb-6">Create New Room</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select Game</label>
                  <div className="grid grid-cols-2 gap-3">
                    {games.map((game) => (
                      <button
                        key={game.key}
                        onClick={() => setGameType(game.key)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          gameType === game.key
                            ? 'border-neon-pink bg-white/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-1">
                          <span className="text-2xl">{game.icon}</span>
                          <span className="text-sm font-semibold text-white">{game.label}</span>
                          <span className="text-xs text-gray-400">
                            {game.maxPlayers === 1 ? 'Single Player' : `${game.maxPlayers} Players`}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={createRoom}
                    disabled={creatingRoom || !connected}
                    className={`px-8 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 ${
                      creatingRoom || !connected
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink text-white'
                    }`}
                  >
                    {creatingRoom ? 'Creating...' : 'Create Room'}
                  </button>
                  {!connected && (
                    <p className="text-red-400 text-sm mt-2">
                      ⚠️ Please connect to the server first
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlinePlayPage;

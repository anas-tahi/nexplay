import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSocket from '../hooks/useSocket';
import TicTacToeGame from '../games/TicTacToeGame';
import MemoryGame from '../games/MemoryGame';
import PongGame from '../games/PongGame';

const OnlineGamePage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState('');
  const { connected } = useSocket();

  const gameComponents = {
    tictactoe: TicTacToeGame,
    memory: MemoryGame,
    pong: PongGame
  };

  useEffect(() => {
    if (!connected) {
      setError('Not connected to server');
      return;
    }

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

      // Join the room
      socketInstance.emit('join-room', roomId);

      // Listen for room events
      socketInstance.on('room-joined', (roomData) => {
        setRoom(roomData);
        setGameState(roomData.gameState);
      });

      socketInstance.on('room-updated', (roomData) => {
        setRoom(roomData);
        setGameState(roomData.gameState);
      });

      socketInstance.on('game-move', (data) => {
        setGameState(prev => ({
          ...prev,
          ...data
        }));
      });

      socketInstance.on('room-error', (errorMsg) => {
        setError(errorMsg);
      });

      socketInstance.on('disconnect', () => {
        setError('Connection lost');
      });

      return () => {
        if (socketInstance) {
          socketInstance.disconnect();
        }
      };
    }
  }, [roomId, connected]);

  const handleGameMove = (move) => {
    if (!socket || !room) return;
    
    socket.emit('game-move', {
      roomId,
      move
    });
  };

  const leaveRoom = () => {
    if (socket) {
      socket.emit('leave-room', roomId);
    }
    navigate('/online-play');
  };

  const getGameComponent = () => {
    if (!room || !gameComponents[room.gameType]) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-400">Game not supported for online play</p>
        </div>
      );
    }

    const GameComponent = gameComponents[room.gameType];
    const isMyTurn = gameState?.currentPlayer === room.players.find(p => p.userId === socket?.userId)?.symbol;

    return (
      <div>
        <GameComponent 
          onMove={handleGameMove}
          gameState={gameState}
          isMyTurn={isMyTurn}
          players={room.players}
          isOnline={true}
        />
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/online-play')}
            className="px-6 py-2 bg-gradient-to-r from-neon-pink to-neon-purple text-white rounded-lg"
          >
            Back to Online Play
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Joining room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-gamer neon-text">
              {room.gameType.charAt(0).toUpperCase() + room.gameType.slice(1)} - Room {room.id}
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                gameState === 'waiting' 
                  ? 'bg-yellow-500/20 text-yellow-400' 
                  : 'bg-green-500/20 text-green-400'
              }`}>
                {gameState === 'waiting' ? '⏳ Waiting for players' : '🎮 Game in progress'}
              </span>
              <span className="text-gray-400">
                {room.players.length}/{room.gameType === 'tictactoe' ? 2 : 2} players
              </span>
            </div>
          </div>
          
          <button
            onClick={leaveRoom}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
          >
            Leave Room
          </button>
        </div>

        {/* Players */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {room.players.map((player, index) => {
            const isMe = socket && player.userId === socket.userId;
            return (
              <div key={player.userId} className={`glass-effect rounded-xl p-4 border ${
                isMe ? 'border-neon-green bg-white/10' : 'border-white/10'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-neon-purple to-neon-green rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {player.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      {player.username}
                      {isMe && <span className="ml-2 text-xs text-neon-green">(You)</span>}
                    </div>
                    <div className="text-sm text-gray-400">
                      Playing as {player.symbol}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Game Area */}
        <div className="glass-effect rounded-xl p-6 border border-white/10">
          {gameState === 'waiting' ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-xl text-gray-400">
                {room.players.length < 2 ? 'Waiting for another player to join...' : 'Ready to start!'}
              </p>
            </div>
          ) : (
            getGameComponent()
          )}
        </div>
      </div>
    </div>
  );
};

export default OnlineGamePage;

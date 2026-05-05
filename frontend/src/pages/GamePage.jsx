import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Leaderboard from '../components/Leaderboard';
import SnakeGame from '../games/SnakeGame';
import MemoryGame from '../games/MemoryGame';
import TicTacToeGame from '../games/TicTacToeGame';
import PongGame from '../games/PongGame';
import BreakoutGame from '../games/BreakoutGame';

const gameData = {
  snake: { title: 'Snake', icon: '🐍', description: 'Eat food, grow longer, don\'t crash!' },
  memory: { title: 'Memory', icon: '🧠', description: 'Find all matching pairs of cards.' },
  tictactoe: { title: 'Tic-Tac-Toe', icon: '⭕', description: 'Get three in a row to win!' },
  pong: { title: 'Pong', icon: '🏓', description: 'Bounce the ball past your opponent.' },
  breakout: { title: 'Breakout', icon: '🧱', description: 'Break all the bricks with the ball.' }
};

const gameComponents = {
  snake: SnakeGame,
  memory: MemoryGame,
  tictactoe: TicTacToeGame,
  pong: PongGame,
  breakout: BreakoutGame
};

const GamePage = () => {
  const { gameType } = useParams();
  const game = gameData[gameType];
  const [finalScore, setFinalScore] = useState(0);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const GameComponent = gameComponents[gameType];

  const handleGameOver = useCallback((score) => {
    setFinalScore(score);
    setShowSubmit(true);
    setMessage('');
  }, []);

  const submitScore = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Please login or play as guest to submit scores.');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('/api/scores/submit', {
        game: gameType,
        score: finalScore
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Score submitted successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to submit score.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!game || !GameComponent) {
    return (
      <div className="text-center py-16">
        <h2 className="text-3xl font-bold font-gamer text-red-400 mb-4">Game Not Found</h2>
        <Link to="/games" className="text-neon-pink hover:text-neon-blue transition-colors">
          Back to Games
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Game Header */}
      <div className="text-center py-8">
        <div className="text-6xl mb-4">{game.icon}</div>
        <h1 className="text-4xl font-bold font-gamer neon-text mb-2">{game.title}</h1>
        <p className="text-gray-400">{game.description}</p>
      </div>

      {/* Game Area */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="glass-effect rounded-xl p-6 md:p-8 border border-white/10 text-center">
          <GameComponent onGameOver={handleGameOver} />
        </div>
      </div>

      {/* Submit Score Section */}
      {showSubmit && (
        <div className="max-w-md mx-auto mb-12">
          <div className="glass-effect rounded-xl p-6 border border-white/10 text-center">
            <p className="text-xl font-bold font-gamer text-neon-green mb-2">Game Over!</p>
            <div className="text-4xl font-bold font-gamer neon-text mb-4">{finalScore}</div>
            <button
              onClick={submitScore}
              disabled={submitting}
              className="px-8 py-3 bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-blue hover:to-neon-green disabled:opacity-50 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              {submitting ? 'Submitting...' : 'Submit Score'}
            </button>
            {message && (
              <p className={`mt-3 text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="max-w-2xl mx-auto">
        <Leaderboard game={gameType} />
      </div>
    </div>
  );
};

export default GamePage;

import { useState } from 'react';
import Leaderboard from '../components/Leaderboard';

const LeaderboardPage = () => {
  const [activeGame, setActiveGame] = useState('snake');

  const games = [
    { key: 'snake', label: 'Snake', icon: '🐍' },
    { key: 'memory', label: 'Memory', icon: '🧠' },
    { key: 'tictactoe', label: 'Tic-Tac-Toe', icon: '⭕' },
    { key: 'pong', label: 'Pong', icon: '🏓' },
    { key: 'breakout', label: 'Breakout', icon: '🧱' }
  ];

  return (
    <div className="min-h-screen">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold font-gamer neon-text mb-4">Leaderboards</h1>
        <p className="text-gray-400">See who is dominating each game!</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {games.map((game) => (
          <button
            key={game.key}
            onClick={() => setActiveGame(game.key)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
              activeGame === game.key
                ? 'bg-gradient-to-r from-neon-pink to-neon-purple text-white'
                : 'glass-effect hover:bg-white/10 text-gray-300'
            }`}
          >
            <span className="mr-2">{game.icon}</span>
            {game.label}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto">
        <Leaderboard game={activeGame} />
      </div>
    </div>
  );
};

export default LeaderboardPage;

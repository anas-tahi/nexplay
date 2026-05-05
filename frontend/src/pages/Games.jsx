import { useState } from 'react';
import CategoryCard from '../components/CategoryCard';
import Leaderboard from '../components/Leaderboard';

const Games = () => {
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    {
      title: 'Snake',
      description: 'Classic snake game. Eat food, grow longer, don\'t hit the walls!',
      gameType: 'snake',
      icon: '🐍'
    },
    {
      title: 'Memory',
      description: 'Card matching game. Test your memory by finding all pairs!',
      gameType: 'memory',
      icon: '🧠'
    },
    {
      title: 'Tic-Tac-Toe',
      description: 'Strategic 3x3 grid game. Get three in a row to win!',
      gameType: 'tictactoe',
      icon: '⭕'
    },
    {
      title: 'Pong',
      description: 'Classic arcade game. Bounce the ball past your opponent!',
      gameType: 'pong',
      icon: '🏓'
    },
    {
      title: 'Breakout',
      description: 'Brick breaker game. Destroy all bricks with the ball!',
      gameType: 'breakout',
      icon: '🧱'
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="text-center py-12">
        <h1 className="text-5xl font-bold font-gamer neon-text mb-4">
          Choose Your Game
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Pick a game and start playing instantly!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {games.map((game) => (
          <CategoryCard key={game.gameType} {...game} />
        ))}
      </div>

      <div className="glass-effect rounded-xl p-6 border border-white/10">
        <h2 className="text-2xl font-bold font-gamer neon-text mb-6 text-center">
          Global Leaderboards
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {games.slice(0, 4).map((game) => (
            <Leaderboard key={game.gameType} game={game.gameType} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Games;

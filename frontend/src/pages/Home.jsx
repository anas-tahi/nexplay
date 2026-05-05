import { Link } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import MultiplayerRooms from '../components/MultiplayerRooms';

const Home = () => {
  const games = [
    { title: 'Snake', description: 'Classic snake game. Eat food, grow longer!', gameType: 'snake', icon: '🐍' },
    { title: 'Memory', description: 'Test your memory by finding all pairs!', gameType: 'memory', icon: '🧠' },
    { title: 'Tic-Tac-Toe', description: 'Strategic 3x3 grid game. Three in a row wins!', gameType: 'tictactoe', icon: '⭕' },
    { title: 'Pong', description: 'Classic arcade game. Bounce to victory!', gameType: 'pong', icon: '🏓' },
    { title: 'Breakout', description: 'Brick breaker game. Clear the board!', gameType: 'breakout', icon: '🧱' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-6xl font-bold font-gamer neon-text mb-4">
          Welcome to NexPlay
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Your ultimate gaming platform. Play, compete, and climb the leaderboards!
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/games"
            className="px-8 py-3 bg-gradient-to-r from-neon-pink to-neon-blue hover:from-neon-blue hover:to-neon-pink text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Play Now
          </Link>
          <Link
            to="/leaderboard"
            className="px-8 py-3 glass-effect hover:bg-white/10 text-white font-bold rounded-lg transition-all duration-300"
          >
            Leaderboards
          </Link>
        </div>
      </div>

      {/* Games Section */}
      <div className="py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold font-gamer neon-text">Popular Games</h2>
          <Link to="/games" className="text-neon-pink hover:text-neon-blue transition-colors font-semibold">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <CategoryCard key={game.gameType} {...game} />
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/leaderboard" className="glass-effect rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 text-center group">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-xl font-bold font-gamer mb-2 group-hover:neon-text transition-all">Leaderboards</h3>
            <p className="text-gray-400 text-sm">See top players across all games</p>
          </Link>
          <Link to="/tournaments" className="glass-effect rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 text-center group">
            <div className="text-4xl mb-3">🎮</div>
            <h3 className="text-xl font-bold font-gamer mb-2 group-hover:neon-text transition-all">Tournaments</h3>
            <p className="text-gray-400 text-sm">Join ranked tournaments and win</p>
          </Link>
          <Link to="/profile" className="glass-effect rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 text-center group">
            <div className="text-4xl mb-3">👤</div>
            <h3 className="text-xl font-bold font-gamer mb-2 group-hover:neon-text transition-all">Profile</h3>
            <p className="text-gray-400 text-sm">Track your stats and achievements</p>
          </Link>
        </div>
      </div>

      {/* Multiplayer Rooms */}
      <MultiplayerRooms />
    </div>
  );
};

export default Home;

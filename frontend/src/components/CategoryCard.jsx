import { Link } from 'react-router-dom';

const CategoryCard = ({ title, description, gameType, icon, color }) => {
  const colorClasses = {
    snake: 'from-green-500 to-emerald-600',
    memory: 'from-purple-500 to-pink-600',
    tictactoe: 'from-blue-500 to-cyan-600',
    pong: 'from-orange-500 to-red-600',
    breakout: 'from-indigo-500 to-purple-600'
  };

  const hoverEffects = {
    snake: 'hover:shadow-green-500/50',
    memory: 'hover:shadow-purple-500/50',
    tictactoe: 'hover:shadow-blue-500/50',
    pong: 'hover:shadow-orange-500/50',
    breakout: 'hover:shadow-indigo-500/50'
  };

  return (
    <Link 
      to={`/games/${gameType}`}
      className="group block"
    >
      <div className={`glass-effect rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${hoverEffects[gameType]} border border-white/10 hover:border-white/20`}>
        {/* Icon */}
        <div className={`w-16 h-16 bg-gradient-to-r ${colorClasses[gameType]} rounded-lg flex items-center justify-center mb-4 group-hover:animate-pulse-slow`}>
          <span className="text-3xl">
            {icon}
          </span>
        </div>
        
        {/* Content */}
        <h3 className="text-xl font-bold font-gamer mb-2 text-white group-hover:neon-text transition-all duration-300">
          {title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          {description}
        </p>
        
        {/* Play Button */}
        <div className="mt-4 flex items-center space-x-2 text-neon-pink group-hover:text-neon-blue transition-colors duration-200">
          <span className="text-sm font-semibold">Play Now</span>
          <svg 
            className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;

import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useSocket from '../hooks/useSocket';
import GlobalChat from './GlobalChat';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const { connected, onlineUsers } = useSocket();

  useEffect(() => {
    const checkUser = () => {
      const savedUser = localStorage.getItem('user');
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };

    checkUser();

    window.addEventListener('auth-change', checkUser);
    window.addEventListener('storage', checkUser);
    return () => {
      window.removeEventListener('auth-change', checkUser);
      window.removeEventListener('storage', checkUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
  };

  return (
    <>
      <nav className="glass-effect sticky top-0 z-40 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-neon-pink to-neon-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold font-gamer text-xl">N</span>
              </div>
              <span className="text-2xl font-bold font-gamer neon-text">NexPlay</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/games"
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
              >
                Games
              </Link>
              <Link
                to="/competition"
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
              >
                Competition
              </Link>
              <Link
                to="/leaderboard"
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
              >
                Leaderboard
              </Link>
              <Link
                to="/tournaments"
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
              >
                Tournaments
              </Link>
              <Link
                to="/online-play"
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
              >
                Online Play
              </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Chat Button */}
              <button
                onClick={() => setShowChat(true)}
                className="relative p-2 glass-effect hover:bg-white/10 rounded-lg transition-all duration-200 group"
              >
                <svg className="w-5 h-5 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                
                {/* Online Users Badge */}
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-neon-green to-neon-blue text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {onlineUsers.length}
                </span>
                
                {/* Connection Status */}
                <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
                  connected ? 'bg-green-500' : 'bg-red-500'
                }`} />
              </button>

              {/* User Section */}
              {user ? (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-neon-purple to-neon-green rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-300 hidden sm:block">
                      {user.isGuest ? `${user.username} (Guest)` : user.username}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 glass-effect hover:bg-white/10 text-white rounded-lg transition-all duration-200 text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink text-white rounded-lg transition-all duration-200 text-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Global Chat Modal */}
      <GlobalChat isOpen={showChat} onClose={() => setShowChat(false)} />
    </>
  );
};

export default Navbar;

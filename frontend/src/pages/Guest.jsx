import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Guest = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Generate random guest username
  const generateRandomUsername = () => {
    const adjectives = ['Cool', 'Fast', 'Smart', 'Brave', 'Quick', 'Silent', 'Dark', 'Light', 'Fire', 'Ice'];
    const nouns = ['Gamer', 'Player', 'Ninja', 'Hero', 'Legend', 'Master', 'Champion', 'Warrior', 'Star', 'Phoenix'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 9999) + 1;
    return `${randomAdj}${randomNoun}${randomNumber}`;
  };

  const handleGenerateUsername = () => {
    setUsername(generateRandomUsername());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!username.trim()) {
      setError('Username is required');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/auth/guest', {
        username: username.trim()
      });

      // Save token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.dispatchEvent(new Event('auth-change'));

      // Redirect to home
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create guest session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="glass-effect rounded-xl p-8 border border-white/10">
        <h2 className="text-3xl font-bold font-gamer mb-6 text-center neon-text">
          Play as Guest
        </h2>
        
        <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500 rounded-lg">
          <p className="text-blue-300 text-sm">
            <span className="font-semibold">Guest Mode:</span> Play instantly without registration. 
            Your scores will be saved temporarily and you can upgrade to a full account anytime!
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Guest Username
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength="3"
                maxLength="20"
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-green focus:ring-2 focus:ring-neon-green/20 transition-all duration-200"
                placeholder="Enter a username"
              />
              <button
                type="button"
                onClick={handleGenerateUsername}
                className="px-4 py-3 bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-blue hover:to-neon-green text-white font-semibold rounded-lg transition-all duration-300 text-sm whitespace-nowrap"
              >
                Random
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-blue hover:to-neon-green text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Creating Session...' : 'Start Playing'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Prefer a full account?{' '}
            <a 
              href="/register" 
              className="text-neon-pink hover:text-neon-blue transition-colors duration-200 font-semibold"
            >
              Sign Up
            </a>
          </p>
        </div>

        <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Guest Limitations:</h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Scores are saved temporarily</li>
            <li>• Limited profile features</li>
            <li>• Can upgrade to full account anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Guest;

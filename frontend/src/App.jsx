import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Guest from './pages/Guest';
import Profile from './pages/Profile';
import Games from './pages/Games';
import GamePage from './pages/GamePage';
import LeaderboardPage from './pages/LeaderboardPage';
import TournamentsPage from './pages/TournamentsPage';
import CompetitionPage from './pages/CompetitionPage';
import OnlinePlayPage from './pages/OnlinePlayPage';
import OnlineGamePage from './pages/OnlineGamePage';
import RequireAuth from './components/RequireAuth';
import NotificationProvider from './components/NotificationSystem';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/guest" element={<Guest />} />
              <Route path="/profile" element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              } />
              <Route path="/games" element={<Games />} />
              <Route path="/games/:gameType" element={<GamePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/tournaments" element={<TournamentsPage />} />
              <Route path="/competition" element={<CompetitionPage />} />
              <Route path="/online-play" element={<OnlinePlayPage />} />
              <Route path="/online-game/:roomId" element={<OnlineGamePage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;

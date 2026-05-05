# NexPlay - Multi-Game Gaming Platform

A full-stack gaming platform where users can play multiple casual games, compete for high scores, and climb global leaderboards.

## 🎮 Features

- **Multiple Games**: Snake, Memory, Tic-Tac-Toe, Pong, Breakout
- **User Authentication**: Register, Login, and Guest mode
- **Score System**: Submit scores and track personal bests
- **Global Leaderboards**: Compete with players worldwide
- **Responsive Design**: Beautiful dark neon theme with Tailwind CSS
- **Real-time Features**: Future support for chat and multiplayer

## 🛠️ Technology Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **LocalStorage** for auth persistence

### Backend
- **Node.js** with Express
- **MongoDB Atlas** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** enabled

## 📁 Project Structure

```
nexplay/
├── backend/
│   ├── models/
│   │   ├── User.js          # User model
│   │   └── Score.js         # Score model
│   ├── controllers/
│   │   ├── authController.js    # Auth logic
│   │   └── scoreController.js   # Score logic
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   └── scoreRoutes.js       # Score endpoints
│   ├── middleware/
│   │   └── auth.js              # JWT middleware
│   ├── server.js            # Express server
│   ├── .env.example         # Environment variables
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx         # Landing page
    │   │   ├── Register.jsx     # Registration
    │   │   ├── Login.jsx        # Login
    │   │   └── Guest.jsx        # Guest mode
    │   ├── components/
    │   │   ├── Navbar.jsx       # Navigation
    │   │   └── CategoryCard.jsx # Game cards
    │   ├── App.jsx              # Main app
    │   ├── main.jsx             # Entry point
    │   └── index.css            # Global styles
    ├── package.json
    └── vite.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB URI:
```
MONGODB_URI=mongodb://localhost:27017/nexplay
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

5. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/guest` - Create guest session

### Scores
- `POST /api/scores/submit` - Submit game score (protected)
- `GET /api/scores/leaderboard/:game` - Get game leaderboard
- `GET /api/scores/personal-best` - Get personal best scores (protected)

### Health Check
- `GET /api/health` - Server health status

## 🎮 Available Games

1. **Snake** - Classic snake game
2. **Memory** - Card matching game
3. **Tic-Tac-Toe** - Strategic 3x3 grid game
4. **Pong** - Classic arcade game
5. **Breakout** - Brick breaker game

## 🔮 Future Features

- [ ] Real-time chat with Socket.io
- [ ] Multiplayer rooms
- [ ] User profiles with avatars
- [ ] Achievements system
- [ ] Sound effects and animations
- [ ] Mobile app version

## 🎨 Design System

- **Theme**: Dark neon gaming aesthetic
- **Colors**: Neon pink, blue, purple, green
- **Fonts**: Orbitron (headers), Space Mono (body)
- **Effects**: Glass morphism, neon glows, smooth animations

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

Built with ❤️ for the gaming community

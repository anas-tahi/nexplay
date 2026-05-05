import { useRef, useEffect, useCallback, useState } from 'react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;
const PADDLE_SPEED = 6;
const BALL_SPEED = 5;
const WIN_SCORE = 5;

const PongGame = ({ onGameOver }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const [score, setScore] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [rallies, setRallies] = useState(0);

  const gameStateRef = useRef({
    playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    aiY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT / 2,
    ballVX: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    ballVY: BALL_SPEED * (Math.random() * 2 - 1),
    playerScore: 0,
    aiScore: 0,
    rallies: 0
  });
  const keysRef = useRef({ up: false, down: false });
  const scoreRef = useRef(0);

  const draw = useCallback((ctx, state) => {
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Center line
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Player paddle
    ctx.fillStyle = '#00ff88';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 8;
    ctx.fillRect(10, state.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // AI paddle
    ctx.fillStyle = '#ff006e';
    ctx.shadowColor = '#ff006e';
    ctx.shadowBlur = 8;
    ctx.fillRect(CANVAS_WIDTH - 10 - PADDLE_WIDTH, state.aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Ball
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(state.ballX, state.ballY, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Scores
    ctx.font = 'bold 48px Orbitron';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'center';
    ctx.fillText(state.playerScore, CANVAS_WIDTH / 4, 60);
    ctx.fillText(state.aiScore, (CANVAS_WIDTH * 3) / 4, 60);
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;

    // Move player paddle
    if (keysRef.current.up) state.playerY -= PADDLE_SPEED;
    if (keysRef.current.down) state.playerY += PADDLE_SPEED;
    state.playerY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.playerY));

    // AI paddle follows ball with some delay
    const aiCenter = state.aiY + PADDLE_HEIGHT / 2;
    const ballTarget = state.ballY;
    const diff = ballTarget - aiCenter;
    if (Math.abs(diff) > 5) {
      state.aiY += Math.sign(diff) * (PADDLE_SPEED * 0.75);
    }
    state.aiY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.aiY));

    // Move ball
    state.ballX += state.ballVX;
    state.ballY += state.ballVY;

    // Top/bottom bounce
    if (state.ballY <= BALL_SIZE / 2 || state.ballY >= CANVAS_HEIGHT - BALL_SIZE / 2) {
      state.ballVY *= -1;
    }

    // Paddle collisions
    if (
      state.ballX <= 10 + PADDLE_WIDTH + BALL_SIZE / 2 &&
      state.ballY >= state.playerY &&
      state.ballY <= state.playerY + PADDLE_HEIGHT &&
      state.ballVX < 0
    ) {
      state.ballVX = Math.abs(state.ballVX) * 1.05;
      state.ballVY += (state.ballY - (state.playerY + PADDLE_HEIGHT / 2)) * 0.1;
      state.rallies++;
      scoreRef.current += 5;
      setScore(scoreRef.current);
      setRallies(state.rallies);
    }

    if (
      state.ballX >= CANVAS_WIDTH - 10 - PADDLE_WIDTH - BALL_SIZE / 2 &&
      state.ballY >= state.aiY &&
      state.ballY <= state.aiY + PADDLE_HEIGHT &&
      state.ballVX > 0
    ) {
      state.ballVX = -Math.abs(state.ballVX) * 1.05;
      state.ballVY += (state.ballY - (state.aiY + PADDLE_HEIGHT / 2)) * 0.1;
      state.rallies++;
      scoreRef.current += 5;
      setScore(scoreRef.current);
      setRallies(state.rallies);
    }

    // Scoring
    if (state.ballX < 0) {
      state.aiScore++;
      setAiScore(state.aiScore);
      if (state.aiScore >= WIN_SCORE) {
        setGameOver(true);
        setStarted(false);
        onGameOver(scoreRef.current);
        return;
      }
      resetBall(state, -1);
    } else if (state.ballX > CANVAS_WIDTH) {
      state.playerScore++;
      setPlayerScore(state.playerScore);
      scoreRef.current += 50;
      setScore(scoreRef.current);
      if (state.playerScore >= WIN_SCORE) {
        setGameOver(true);
        setStarted(false);
        onGameOver(scoreRef.current);
        return;
      }
      resetBall(state, 1);
    }

    draw(ctx, state);
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [draw, onGameOver]);

  const resetBall = (state, direction) => {
    state.ballX = CANVAS_WIDTH / 2;
    state.ballY = CANVAS_HEIGHT / 2;
    state.ballVX = BALL_SPEED * direction;
    state.ballVY = BALL_SPEED * (Math.random() * 2 - 1);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (!started) {
      draw(ctx, gameStateRef.current);
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [started, draw]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp') keysRef.current.up = true;
      if (e.key === 'ArrowDown') keysRef.current.down = true;
    };
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowUp') keysRef.current.up = false;
      if (e.key === 'ArrowDown') keysRef.current.down = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const startGame = () => {
    gameStateRef.current = {
      playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      aiY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      ballX: CANVAS_WIDTH / 2,
      ballY: CANVAS_HEIGHT / 2,
      ballVX: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      ballVY: BALL_SPEED * (Math.random() * 2 - 1),
      playerScore: 0,
      aiScore: 0,
      rallies: 0
    };
    scoreRef.current = 0;
    setScore(0);
    setPlayerScore(0);
    setAiScore(0);
    setRallies(0);
    setGameOver(false);
    setStarted(true);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex items-center space-x-6">
        <div className="text-xl font-bold text-neon-green">You: {playerScore}</div>
        <div className="text-xl font-bold font-gamer neon-text">Score: {score}</div>
        <div className="text-xl font-bold text-red-400">AI: {aiScore}</div>
      </div>
      <div className="text-sm text-gray-400 mb-2">Rallies: {rallies}</div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="rounded-lg border border-white/10 max-w-full"
      />
      {!started && (
        <div className="mt-4 text-center">
          {gameOver && (
            <p className="text-xl font-bold font-gamer text-neon-pink mb-4">
              {playerScore >= WIN_SCORE ? 'You Win!' : 'AI Wins!'} Final Score: {score}
            </p>
          )}
          <button
            onClick={startGame}
            className="px-8 py-3 bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            {gameOver ? 'Play Again' : 'Start Game'}
          </button>
          <p className="mt-2 text-gray-400 text-sm">Use Arrow Up/Down to move paddle</p>
        </div>
      )}
    </div>
  );
};

export default PongGame;

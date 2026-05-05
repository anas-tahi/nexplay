import { useRef, useEffect, useCallback, useState } from 'react';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 12;
const BALL_SIZE = 10;
const BALL_SPEED = 4;
const PADDLE_SPEED = 7;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 50;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 5;
const BRICK_OFFSET_TOP = 50;
const BRICK_OFFSET_LEFT = 25;

const COLORS = ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#ffbe0b'];

const BreakoutGame = ({ onGameOver }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);

  const gameStateRef = useRef({
    paddleX: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT - 50,
    ballVX: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    ballVY: -BALL_SPEED,
    bricks: [],
    lives: 3
  });
  const keysRef = useRef({ left: false, right: false });
  const scoreRef = useRef(0);

  const createBricks = useCallback(() => {
    const bricks = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks.push({
          x: BRICK_OFFSET_LEFT + c * (BRICK_WIDTH + BRICK_PADDING),
          y: BRICK_OFFSET_TOP + r * (BRICK_HEIGHT + BRICK_PADDING),
          w: BRICK_WIDTH,
          h: BRICK_HEIGHT,
          color: COLORS[r % COLORS.length],
          active: true
        });
      }
    }
    return bricks;
  }, []);

  const draw = useCallback((ctx, state) => {
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Bricks
    state.bricks.forEach(brick => {
      if (!brick.active) return;
      ctx.fillStyle = brick.color;
      ctx.shadowColor = brick.color;
      ctx.shadowBlur = 5;
      ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
      ctx.shadowBlur = 0;
    });

    // Paddle
    ctx.fillStyle = '#00ff88';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 8;
    ctx.fillRect(state.paddleX, CANVAS_HEIGHT - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.shadowBlur = 0;

    // Ball
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(state.ballX, state.ballY, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;

    // Move paddle
    if (keysRef.current.left) state.paddleX -= PADDLE_SPEED;
    if (keysRef.current.right) state.paddleX += PADDLE_SPEED;
    state.paddleX = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, state.paddleX));

    // Move ball
    state.ballX += state.ballVX;
    state.ballY += state.ballVY;

    // Wall bounces
    if (state.ballX <= BALL_SIZE / 2 || state.ballX >= CANVAS_WIDTH - BALL_SIZE / 2) {
      state.ballVX *= -1;
    }
    if (state.ballY <= BALL_SIZE / 2) {
      state.ballVY = Math.abs(state.ballVY);
    }

    // Paddle collision
    if (
      state.ballY >= CANVAS_HEIGHT - PADDLE_HEIGHT - 10 - BALL_SIZE / 2 &&
      state.ballY <= CANVAS_HEIGHT - 10 &&
      state.ballX >= state.paddleX &&
      state.ballX <= state.paddleX + PADDLE_WIDTH &&
      state.ballVY > 0
    ) {
      state.ballVY = -Math.abs(state.ballVY);
      const hitPos = (state.ballX - state.paddleX) / PADDLE_WIDTH;
      state.ballVX = (hitPos - 0.5) * 6;
    }

    // Brick collisions
    state.bricks.forEach(brick => {
      if (!brick.active) return;
      if (
        state.ballX >= brick.x &&
        state.ballX <= brick.x + brick.w &&
        state.ballY >= brick.y &&
        state.ballY <= brick.y + brick.h
      ) {
        brick.active = false;
        state.ballVY *= -1;
        scoreRef.current += 10 * level;
        setScore(scoreRef.current);
      }
    });

    // Check if all bricks destroyed
    if (state.bricks.every(b => !b.active)) {
      setLevel(l => l + 1);
      state.bricks = createBricks();
      state.ballX = CANVAS_WIDTH / 2;
      state.ballY = CANVAS_HEIGHT - 50;
      state.ballVX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1) * (1 + level * 0.1);
      state.ballVY = -BALL_SPEED * (1 + level * 0.1);
    }

    // Ball falls below
    if (state.ballY > CANVAS_HEIGHT) {
      state.lives--;
      setLives(state.lives);
      if (state.lives <= 0) {
        setGameOver(true);
        setStarted(false);
        onGameOver(scoreRef.current);
        return;
      }
      state.ballX = CANVAS_WIDTH / 2;
      state.ballY = CANVAS_HEIGHT - 50;
      state.ballVX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
      state.ballVY = -BALL_SPEED;
    }

    draw(ctx, state);
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [draw, createBricks, level, onGameOver]);

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
      if (e.key === 'ArrowLeft') keysRef.current.left = true;
      if (e.key === 'ArrowRight') keysRef.current.right = true;
    };
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft') keysRef.current.left = false;
      if (e.key === 'ArrowRight') keysRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const startGame = () => {
    const bricks = createBricks();
    gameStateRef.current = {
      paddleX: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
      ballX: CANVAS_WIDTH / 2,
      ballY: CANVAS_HEIGHT - 50,
      ballVX: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      ballVY: -BALL_SPEED,
      bricks,
      lives: 3
    };
    scoreRef.current = 0;
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameOver(false);
    setStarted(true);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex items-center space-x-6">
        <div className="text-xl font-bold font-gamer neon-text">Score: {score}</div>
        <div className="text-xl font-bold text-yellow-400">Level: {level}</div>
        <div className="text-xl font-bold text-red-400">Lives: {'❤️'.repeat(lives)}</div>
      </div>
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
              Game Over! Final Score: {score}
            </p>
          )}
          <button
            onClick={startGame}
            className="px-8 py-3 bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            {gameOver ? 'Play Again' : 'Start Game'}
          </button>
          <p className="mt-2 text-gray-400 text-sm">Use Arrow Left/Right to move paddle</p>
        </div>
      )}
    </div>
  );
};

export default BreakoutGame;

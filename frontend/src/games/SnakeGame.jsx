import { useRef, useEffect, useCallback, useState } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_WIDTH = GRID_SIZE * CELL_SIZE;
const CANVAS_HEIGHT = GRID_SIZE * CELL_SIZE;
const GAME_SPEED = 120;

const SnakeGame = ({ onGameOver }) => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const snakeRef = useRef([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ]);
  const directionRef = useRef({ x: 1, y: 0 });
  const nextDirectionRef = useRef({ x: 1, y: 0 });
  const foodRef = useRef({ x: 15, y: 10 });
  const scoreRef = useRef(0);

  const generateFood = useCallback((snake) => {
    let food;
    do {
      food = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snake.some(seg => seg.x === food.x && seg.y === food.y));
    return food;
  }, []);

  const draw = useCallback((ctx, snake, food) => {
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_WIDTH, i * CELL_SIZE);
      ctx.stroke();
    }

    // Food
    ctx.fillStyle = '#ff006e';
    ctx.shadowColor = '#ff006e';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Snake
    snake.forEach((seg, i) => {
      const isHead = i === 0;
      ctx.fillStyle = isHead ? '#00ff88' : '#00cc6a';
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = isHead ? 8 : 0;
      ctx.fillRect(
        seg.x * CELL_SIZE + 1,
        seg.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
      ctx.shadowBlur = 0;

      if (isHead) {
        ctx.fillStyle = '#0f0f23';
        ctx.fillRect(seg.x * CELL_SIZE + 5, seg.y * CELL_SIZE + 5, 3, 3);
        ctx.fillRect(seg.x * CELL_SIZE + 12, seg.y * CELL_SIZE + 5, 3, 3);
      }
    });
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    directionRef.current = nextDirectionRef.current;
    const snake = [...snakeRef.current];
    const dir = directionRef.current;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      setGameOver(true);
      setStarted(false);
      onGameOver(scoreRef.current);
      return;
    }

    // Self collision
    if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      setGameOver(true);
      setStarted(false);
      onGameOver(scoreRef.current);
      return;
    }

    snake.unshift(head);

    // Eat food
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      scoreRef.current += 10;
      setScore(scoreRef.current);
      foodRef.current = generateFood(snake);
    } else {
      snake.pop();
    }

    snakeRef.current = snake;
    draw(ctx, snake, foodRef.current);
    gameLoopRef.current = setTimeout(gameLoop, GAME_SPEED);
  }, [draw, generateFood, onGameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (!started && !gameOver) {
      draw(ctx, snakeRef.current, foodRef.current);
    }

    return () => {
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    };
  }, [started, gameOver, draw]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!started) return;
      const dir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
          if (dir.y === 0) nextDirectionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          if (dir.y === 0) nextDirectionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          if (dir.x === 0) nextDirectionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          if (dir.x === 0) nextDirectionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started]);

  const startGame = () => {
    snakeRef.current = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };
    foodRef.current = generateFood(snakeRef.current);
    scoreRef.current = 0;
    setScore(0);
    setGameOver(false);
    setStarted(true);
    gameLoopRef.current = setTimeout(gameLoop, GAME_SPEED);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-2xl font-bold font-gamer neon-text">Score: {score}</div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="rounded-lg border border-white/10"
        style={{ imageRendering: 'pixelated' }}
      />
      {!started && (
        <div className="mt-4">
          {gameOver && (
            <p className="text-xl text-neon-pink font-bold font-gamer mb-4">Game Over! Final Score: {score}</p>
          )}
          <button
            onClick={startGame}
            className="px-8 py-3 bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            {gameOver ? 'Play Again' : 'Start Game'}
          </button>
          <p className="mt-2 text-gray-400 text-sm">Use Arrow Keys to move</p>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;

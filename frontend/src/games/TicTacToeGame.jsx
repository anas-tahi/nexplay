import { useState, useCallback } from 'react';

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6]             // diagonals
];

const TicTacToeGame = ({ onGameOver, onMove, gameState, isMyTurn, players, isOnline = false }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [score, setScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [wins, setWins] = useState(0);
  const [draws, setDraws] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Initialize board from online game state
  useEffect(() => {
    if (isOnline && gameState?.board) {
      setBoard(gameState.board);
      setWinner(gameState.winner);
      setGameOver(gameState.gameOver);
    }
  }, [isOnline, gameState]);

  const checkWinner = useCallback((squares) => {
    for (const [a, b, c] of WINNING_LINES) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (squares.every(s => s !== null)) return 'draw';
    return null;
  }, []);

  const getAIMove = useCallback((squares) => {
    // Simple AI: try to win, block, or pick center/corners/random
    const available = squares.map((s, i) => s === null ? i : null).filter(i => i !== null);

    // Try to win
    for (const move of available) {
      const test = [...squares];
      test[move] = 'O';
      if (checkWinner(test) === 'O') return move;
    }

    // Block player win
    for (const move of available) {
      const test = [...squares];
      test[move] = 'X';
      if (checkWinner(test) === 'X') return move;
    }

    // Take center
    if (available.includes(4)) return 4;

    // Take corner
    const corners = [0, 2, 6, 8].filter(c => available.includes(c));
    if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

    // Random
    return available[Math.floor(Math.random() * available.length)];
  }, [checkWinner]);

  const endGame = useCallback((result, currentBoard) => {
    setGameOver(true);
    setGamesPlayed(g => g + 1);

    let finalScore = score;
    if (result === 'X') {
      setWins(w => w + 1);
      finalScore += 100;
      setScore(finalScore);
      setWinner('You Win!');
    } else if (result === 'O') {
      setWinner('AI Wins!');
      finalScore += 10;
      setScore(finalScore);
    } else {
      setDraws(d => d + 1);
      finalScore += 50;
      setScore(finalScore);
      setWinner('Draw!');
    }

    onGameOver(finalScore);
  }, [score, onGameOver]);

  const handleClick = (index) => {
    if (board[index] || winner) return;

    if (isOnline) {
      // Send move to server for online play
      onMove({ index });
    } else {
      // Local play against AI
      const newBoard = [...board];
      newBoard[index] = isXNext ? 'X' : 'O';
      setBoard(newBoard);

      const result = checkWinner(newBoard);
      if (result) {
        setWinner(result);
        setGameOver(true);
        const finalScore = result === 'draw' ? 50 : (result === 'X' ? 100 : 10);
        setScore(score + finalScore);
        setGamesPlayed(gamesPlayed + 1);
        if (result === 'X') setWins(wins + 1);
        else if (result === 'draw') setDraws(draws + 1);
        onGameOver(score + finalScore);
      } else {
        setIsXNext(!isXNext);
      }
    }, [isXNext, board]);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setGameOver(false);
  };

  const resetScore = () => {
    setScore(0);
    setGamesPlayed(0);
    setWins(0);
    setDraws(0);
    resetGame();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex space-x-4 text-sm">
        <span className="text-neon-green font-bold">Wins: {wins}</span>
        <span className="text-gray-300">Draws: {draws}</span>
        <span className="text-red-400">Losses: {gamesPlayed - wins - draws}</span>
        <span className="font-gamer neon-text text-lg">Score: {score}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            disabled={!!cell || gameOver}
            className={`w-20 h-20 md:w-24 md:h-24 rounded-xl text-4xl flex items-center justify-center transition-all duration-200 border border-white/10 ${
              cell === 'X'
                ? 'text-neon-pink bg-white/10'
                : cell === 'O'
                ? 'text-neon-blue bg-white/10'
                : 'bg-white/5 hover:bg-white/10 cursor-pointer'
            }`}
          >
            {cell}
          </button>
        ))}
      </div>

      {winner && (
        <div className="text-center mb-4">
          <p className={`text-2xl font-bold font-gamer mb-2 ${
            winner.includes('You') ? 'text-neon-green' : winner.includes('AI') ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {winner}
          </p>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={resetGame}
          className="px-6 py-2 bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink text-white font-bold rounded-lg transition-all duration-300"
        >
          {gameOver ? 'Play Again' : 'Restart'}
        </button>
        <button
          onClick={resetScore}
          className="px-6 py-2 glass-effect hover:bg-white/10 text-white font-bold rounded-lg transition-all duration-300"
        >
          Reset Score
        </button>
      </div>

      <p className="mt-3 text-gray-400 text-sm">You are X. Click a square to play.</p>
    </div>
  );
};

export default TicTacToeGame;

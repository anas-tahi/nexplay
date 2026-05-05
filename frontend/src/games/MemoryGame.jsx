import { useState, useEffect, useCallback } from 'react';

const ICONS = ['🎮', '🕹️', '🎯', '🎲', '🎪', '🎨', '🎭', '🎸'];

const MemoryGame = ({ onGameOver }) => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [lockBoard, setLockBoard] = useState(false);

  const initGame = useCallback(() => {
    const deck = [...ICONS, ...ICONS]
      .sort(() => Math.random() - 0.5)
      .map((icon, i) => ({ id: i, icon, matched: false }));
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setScore(0);
    setGameOver(false);
    setStarted(true);
    setLockBoard(false);
  }, []);

  const handleCardClick = (index) => {
    if (lockBoard || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setLockBoard(true);
      setMoves(m => m + 1);

      const [first, second] = newFlipped;
      if (cards[first].icon === cards[second].icon) {
        setTimeout(() => {
          setMatched(prev => {
            const updated = [...prev, first, second];
            const newScore = score + 50;
            setScore(newScore);
            if (updated.length === cards.length) {
              const finalScore = Math.max(0, newScore - moves * 2);
              setScore(finalScore);
              setGameOver(true);
              setStarted(false);
              onGameOver(finalScore);
            }
            return updated;
          });
          setFlipped([]);
          setLockBoard(false);
        }, 500);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setLockBoard(false);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (!started && cards.length === 0) {
      initGame();
    }
  }, [started, cards.length, initGame]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex space-x-6">
        <div className="text-xl font-bold font-gamer neon-text">Score: {score}</div>
        <div className="text-xl font-bold text-gray-300">Moves: {moves}</div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index);
          const isMatched = matched.includes(index);
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              disabled={isFlipped || lockBoard || gameOver}
              className={`w-16 h-16 md:w-20 md:h-20 rounded-xl text-3xl flex items-center justify-center transition-all duration-300 transform ${
                isFlipped
                  ? isMatched
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 scale-105 shadow-lg shadow-green-500/30'
                    : 'bg-white/10'
                  : 'bg-white/5 hover:bg-white/10 hover:scale-105 cursor-pointer'
              } border border-white/10`}
            >
              {isFlipped ? card.icon : '❓'}
            </button>
          );
        })}
      </div>

      {gameOver && (
        <div className="text-center">
          <p className="text-xl text-neon-green font-bold font-gamer mb-2">Completed!</p>
          <p className="text-gray-400 mb-4">Final Score: {score}</p>
          <button
            onClick={initGame}
            className="px-8 py-3 bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Play Again
          </button>
        </div>
      )}

      {!started && !gameOver && (
        <button
          onClick={initGame}
          className="px-8 py-3 bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          Start Game
        </button>
      )}
    </div>
  );
};

export default MemoryGame;

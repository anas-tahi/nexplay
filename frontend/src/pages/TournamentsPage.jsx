import Tournaments from '../components/Tournaments';

const TournamentsPage = () => {
  return (
    <div className="min-h-screen">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold font-gamer neon-text mb-4">Tournaments</h1>
        <p className="text-gray-400">Compete in tournaments and climb the rankings!</p>
      </div>
      <Tournaments />
    </div>
  );
};

export default TournamentsPage;

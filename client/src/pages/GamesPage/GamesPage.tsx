import { Link } from "react-router";
import { useGames } from "../../api/hooks/useGames";

export const GamesPage = () => {
  const {
    data: { games },
  } = useGames();

  return (
    <div>
      {games.map((game) => (
        <div key={game.uuid}>
          <Link to={`/games/${game.uuid}`}>
            {game.is_owner ? "Owner" : "Guest"}: {game.uuid}
          </Link>
        </div>
      ))}
    </div>
  );
};

import { Link } from "react-router";
import { useGames } from "../../api/hooks/useGames";
import { useNewGame } from "@/api/hooks/useNewGame";
import { Button } from "@/components/ui/button";
import { useGamesSubscription } from "@/api/hooks/useGamesSubscription";

export const GamesPage = () => {
  const {
    data: { games },
  } = useGames();

  const newGame = useNewGame();

  useGamesSubscription();

  const onCreateGame = () => {
    newGame.mutateAsync();
  };

  return (
    <div>
      <Button onClick={onCreateGame}>Create new game</Button>
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

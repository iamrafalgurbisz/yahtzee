import { Link } from "react-router";
import { ChevronRightIcon, PlusIcon } from "lucide-react";
import { useGames } from "../../api/hooks/useGames";
import { useNewGame } from "@/api/hooks/useNewGame";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GameStatusBadge } from "@/components/GameStatusBadge/GameStatusBadge";
import { useGamesSubscription } from "@/api/hooks/useGamesSubscription";
import { GAME_STATUS } from "@shared/types/gameStatus";
import { formatDateTime } from "@/lib/formatDateTime";

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
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Your games</h1>
        <Button onClick={onCreateGame} disabled={newGame.isPending}>
          <PlusIcon />
          New game
        </Button>
      </div>

      {games.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No games yet. Create one and invite your friends.
          </CardContent>
        </Card>
      ) : (
        <Card className="py-0">
          <ul className="divide-y">
            {games.map((game) => (
              <li key={game.uuid}>
                <Link
                  to={`/games/${game.uuid}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="grid flex-1 gap-0.5">
                    <span className="font-medium">
                      Game from {formatDateTime(game.created_at)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {game.is_owner ? "Host" : "Guest"}
                      {game.status === GAME_STATUS.IN_PROGRESS &&
                        ` · Round ${game.round} / 15`}
                    </span>
                  </div>
                  {game.status === GAME_STATUS.IN_PROGRESS &&
                    game.is_my_turn && <Badge>Your turn</Badge>}
                  <GameStatusBadge status={game.status} />
                  <ChevronRightIcon className="size-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

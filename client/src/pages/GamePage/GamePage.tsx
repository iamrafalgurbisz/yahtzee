import { useParams } from "react-router";
import { PlayIcon } from "lucide-react";
import { useGame } from "../../api/hooks/useGame";
import { GameInfo } from "./components/GameInfo/GameInfo";
import { GameActions } from "./components/GameActions/GameActions";
import { useGameSubscription } from "@/api/hooks/useGameSubscription";
import { CopyLink } from "@/components/CopyLink/CopyLink";
import { GameStatusBadge } from "@/components/GameStatusBadge/GameStatusBadge";
import { GAME_STATUS } from "@shared/types/gameStatus";
import { formatDateTime } from "@/lib/formatDateTime";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStartGame } from "@/api/hooks/useStartGame";

export const GamePage = () => {
  const { uuid } = useParams<{ uuid: string }>();

  const { data: game } = useGame(uuid);
  const startGame = useStartGame(uuid);

  useGameSubscription(uuid);

  const onStartGame = () => {
    startGame.mutateAsync();
  };

  if (game.status === GAME_STATUS.WAITING) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">Waiting room</CardTitle>
          <CardDescription>
            {game.is_owner
              ? "Share the link with your friends, then start the game."
              : "Waiting for the host to start the game."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {game.is_owner && (
            <CopyLink
              url={`${window.location.origin}/games/${game.uuid}/join`}
            />
          )}
          <div className="grid gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">
              Players ({game.players.length})
            </span>
            <ul className="grid gap-1">
              {game.players.map((player) => (
                <li key={player.player_uuid}>{player.display_name}</li>
              ))}
            </ul>
          </div>
        </CardContent>
        {game.is_owner && (
          <CardFooter className="border-t">
            <Button
              size="lg"
              className="w-full"
              onClick={onStartGame}
              disabled={startGame.isPending}
            >
              <PlayIcon />
              Start game
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">
          Game from {formatDateTime(game.created_at)}
        </h1>
        <GameStatusBadge status={game.status} />
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-[1fr_auto]">
        <Card className="py-0">
          <GameInfo gameUuid={uuid} />
        </Card>
        <GameActions
          key={`${game.uuid}-${game.round}-${game.current_seat}`}
          gameUuid={uuid}
        />
      </div>
    </div>
  );
};

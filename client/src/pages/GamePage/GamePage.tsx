import { useParams } from "react-router";
import { useGame } from "../../api/hooks/useGame";
import { GameInfo } from "./components/GameInfo/GameInfo";
import { GameActions } from "./components/GameActions/GameActions";
import { useGameSubscription } from "@/api/hooks/useGameSubscription";
import { CopyLink } from "@/components/CopyLink/CopyLink";
import { GAME_STATUS } from "@shared/types/gameStatus";

export const GamePage = () => {
  const { uuid } = useParams<{ uuid: string }>();

  const { data: game } = useGame(uuid);

  useGameSubscription(uuid);

  if (game.status === GAME_STATUS.WAITING) {
    return (
      <div>
        {game.is_owner && (
          <CopyLink url={`http://localhost:3001/games/${game.uuid}/join`} />
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2">
      <GameInfo gameUuid={uuid} />
      <GameActions
        key={`${game.uuid}-${game.round}-${game.current_seat}`}
        gameUuid={uuid}
      />
    </div>
  );
};

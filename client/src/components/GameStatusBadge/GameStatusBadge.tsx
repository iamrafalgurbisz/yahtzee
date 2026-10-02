import type React from "react";
import { Badge } from "@/components/ui/badge";
import { GAME_STATUS } from "@shared/types/gameStatus";
import type { GameResponseDto } from "@/@types/apiTypes";

const LABELS: Record<GameResponseDto["status"], string> = {
  [GAME_STATUS.WAITING]: "Waiting",
  [GAME_STATUS.IN_PROGRESS]: "In progress",
  [GAME_STATUS.FINISHED]: "Finished",
};

export const GameStatusBadge: React.FC<{
  status: GameResponseDto["status"];
}> = ({ status }) => {
  return (
    <Badge variant={status === GAME_STATUS.IN_PROGRESS ? "secondary" : "outline"}>
      {LABELS[status]}
    </Badge>
  );
};

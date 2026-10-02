import type { GameResponseDto } from "@/@types/apiTypes";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { getPossibleScores } from "@shared/helpers/getPossibleScores";
import type { Category } from "@shared/types/gameCategories";
import type React from "react";
import classNames from "classnames";
import { useMemo } from "react";
import { useCommit } from "@/api/hooks/useCommit";

interface Props {
  category: Category;
  currentSeat: number;
  dice: number[];
  isMyTurn: boolean;
  gameUuid: string;
  player: GameResponseDto["players"][number];
}

export const ScoreCell: React.FC<Props> = ({
  category,
  dice,
  gameUuid,
  player,
  isMyTurn,
  currentSeat,
}) => {
  const commit = useCommit(gameUuid);

  const onCommit = (category: Category, score: number) => {
    commit.mutateAsync({ category, score });
  };

  const playerScore = player[category];

  const content = useMemo(() => {
    if (player.seat === currentSeat && playerScore === null && dice.length) {
      return (
        <div className="flex gap-1">
          {getPossibleScores(category, dice).map((score, i) => (
            <Button
              key={`${score}${i}`}
              size="icon-sm"
              variant={score === 0 ? "destructive" : "default"}
              disabled={!isMyTurn}
              onClick={() => onCommit(category, score)}
            >
              {score}
            </Button>
          ))}
        </div>
      );
    }

    return <div>{playerScore ?? "-"}</div>;
  }, [playerScore, dice, isMyTurn]);

  const styles = classNames({
    ["bg-secondary"]: player.seat === currentSeat,
  });

  return <TableCell className={styles}>{content}</TableCell>;
};

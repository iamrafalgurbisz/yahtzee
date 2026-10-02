import type { GameResponseDto } from "@/@types/apiTypes";
import { TableCell } from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { getPossibleScores } from "@shared/helpers/getPossibleScores";
import { MAX_SCORES, type Category } from "@shared/types/gameCategories";
import type React from "react";
import { cn } from "@/lib/utils";

interface Props {
  category: Category;
  currentSeat: number;
  dice: number[];
  isMyTurn: boolean;
  isSelected: boolean;
  onSelect: (score: number) => void;
  player: GameResponseDto["players"][number];
}

export const ScoreCell: React.FC<Props> = ({
  category,
  dice,
  player,
  isMyTurn,
  isSelected,
  onSelect,
  currentSeat,
}) => {
  const playerScore = player[category];
  const isCurrent = player.seat === currentSeat;
  const canPick =
    isCurrent && isMyTurn && playerScore === null && dice.length > 0;

  const preview = canPick ? Math.max(...getPossibleScores(category, dice)) : 0;
  const isMax = preview === MAX_SCORES[category];

  return (
    <TableCell
      className={cn(
        "text-center tabular-nums",
        isCurrent && "bg-muted/60",
        canPick && "p-1",
      )}
    >
      {canPick ? (
        <button
          type="button"
          onClick={() => onSelect(preview)}
          className={cn(
            buttonVariants({
              size: "sm",
              variant: isSelected
                ? "default"
                : preview === 0
                  ? "destructive"
                  : "outline",
            }),
            "w-full tabular-nums",
            !isSelected &&
              isMax &&
              "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400",
          )}
        >
          {preview}
        </button>
      ) : playerScore === null ? (
        <span className="text-muted-foreground/50">–</span>
      ) : (
        playerScore
      )}
    </TableCell>
  );
};

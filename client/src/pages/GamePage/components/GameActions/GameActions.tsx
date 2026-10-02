import { useGame } from "@/api/hooks/useGame";
import { useRoll } from "@/api/hooks/useRoll";
import { useCommit } from "@/api/hooks/useCommit";
import { Die } from "@/components/Die/Die";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type React from "react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CheckIcon, DicesIcon } from "lucide-react";
import { GAME_STATUS } from "@shared/types/gameStatus";
import type { ScoreSelection } from "../../types";
import { CATEGORY_LABELS } from "../GameInfo/categoryLabels";

interface Props {
  gameUuid: string;
  selected: ScoreSelection | null;
}

export const GameActions: React.FC<Props> = ({ gameUuid, selected }) => {
  const { data: game } = useGame(gameUuid);
  const [keep, setKeep] = useState<Set<number>>(() => new Set());

  const roll = useRoll(gameUuid);
  const commit = useCommit(gameUuid);

  const onRoll = () => {
    roll.mutateAsync({ keep: [...keep] });
  };

  const onToggleKeep = (i: number) => {
    setKeep((prev) => {
      const next = new Set(prev);

      if (next.has(i)) next.delete(i);
      else next.add(i);

      return next;
    });
  };

  const currentPlayer = game.players.find(
    (player) => player.seat === game.current_seat,
  );
  const rollsLeft = 3 - game.rolls_used;
  const hasRolled = game.rolls_used > 0;
  const canKeep = game.is_my_turn && hasRolled && rollsLeft > 0;

  const description = !game.is_my_turn
    ? "Waiting for their move."
    : !hasRolled
      ? "Roll the dice to start your turn."
      : rollsLeft > 0
        ? "Tap dice to keep them, roll again or pick a category in the table."
        : "Pick a category in the table.";

  if (game.status === GAME_STATUS.FINISHED) {
    return (
      <Card className="lg:w-96">
        <CardHeader>
          <CardTitle className="text-lg">Game over</CardTitle>
          <CardDescription>All rounds have been played.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="lg:w-96">
      <CardHeader>
        <CardTitle className="text-lg">
          {game.is_my_turn
            ? "Your turn"
            : `${currentPlayer?.display_name}'s turn`}
        </CardTitle>
        <CardDescription>
          Round {game.round} / 15 · {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between gap-1">
          {hasRolled
            ? game.dice.map((d, i) => (
                <button
                  key={`${d}${i}`}
                  type="button"
                  disabled={!canKeep}
                  onClick={() => onToggleKeep(i)}
                  className="rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 enabled:cursor-pointer"
                >
                  <Die value={d} keep={keep.has(i)} className="size-14" />
                </button>
              ))
            : Array.from({ length: 5 }, (_, i) => (
                <Die key={i} value={null} className="size-14" />
              ))}
        </div>
      </CardContent>
      {game.is_my_turn && (
        <CardFooter className="grid gap-2 border-t">
          {selected && (
            <div className="flex gap-2">
              {selected.score > 0 && (
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={() => commit.mutate(selected)}
                  disabled={commit.isPending}
                >
                  <CheckIcon />
                  Score {selected.score} in {CATEGORY_LABELS[selected.category]}
                </Button>
              )}
              <Button
                size="lg"
                variant="destructive"
                className={cn(selected.score === 0 && "flex-1")}
                onClick={() =>
                  commit.mutate({ category: selected.category, score: 0 })
                }
                disabled={commit.isPending}
              >
                {selected.score > 0
                  ? "Score 0"
                  : `Score 0 in ${CATEGORY_LABELS[selected.category]}`}
              </Button>
            </div>
          )}
          <Button
            size="lg"
            variant={selected || rollsLeft === 0 ? "outline" : "default"}
            className="transition-none"
            onClick={onRoll}
            disabled={rollsLeft === 0 || roll.isPending || commit.isPending}
          >
            <DicesIcon />
            Roll ({rollsLeft} left)
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

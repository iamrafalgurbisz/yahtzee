import { useGame } from "@/api/hooks/useGame";
import { useRoll } from "@/api/hooks/useRoll";
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
import { useState } from "react";
import { DicesIcon } from "lucide-react";
import { GAME_STATUS } from "@shared/types/gameStatus";

interface Props {
  gameUuid: string;
}

export const GameActions: React.FC<Props> = ({ gameUuid }) => {
  const { data: game } = useGame(gameUuid);
  const [keep, setKeep] = useState<Set<number>>(() => new Set());

  const roll = useRoll(gameUuid);

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
        ? "Tap dice to keep them, roll again or pick a score."
        : "Pick a score in the table.";

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
          {game.is_my_turn ? "Your turn" : `${currentPlayer?.display_name}'s turn`}
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
        <CardFooter className="border-t">
          <Button
            size="lg"
            className="w-full"
            onClick={onRoll}
            disabled={rollsLeft === 0 || roll.isPending}
          >
            <DicesIcon />
            Roll ({rollsLeft} left)
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

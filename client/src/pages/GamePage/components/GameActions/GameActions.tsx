import { useGame } from "@/api/hooks/useGame";
import { useRoll } from "@/api/hooks/useRoll";
import { Die } from "@/components/Die/Die";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type React from "react";
import { useState } from "react";
import { InfoIcon } from "lucide-react";

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

  return (
    <div>
      <div>
        <Button onClick={onRoll} disabled={!game.is_my_turn}>
          Roll ({3 - game.rolls_used} rolls left)
        </Button>
        <div>
          {game.rolls_used > 0 ? (
            <div>
              {game.is_my_turn && (
                <Alert>
                  <InfoIcon />
                  <AlertTitle>Press a die to keep it</AlertTitle>
                </Alert>
              )}
              <div className="flex">
                {game.dice.map((d, i) => (
                  <span key={`${d}${i}`} onClick={() => onToggleKeep(i)}>
                    <Die value={d} keep={keep.has(i)} />
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex">
              <span>
                <Die value={null} />
              </span>
              <span>
                <Die value={null} />
              </span>
              <span>
                <Die value={null} />
              </span>
              <span>
                <Die value={null} />
              </span>
              <span>
                <Die value={null} />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

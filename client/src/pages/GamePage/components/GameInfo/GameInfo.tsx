import type React from "react";
import { useGame } from "../../../../api/hooks/useGame";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CATEGORIES } from "@shared/types/gameCategories";
import { ScoreCell } from "./components/ScoreCell/ScoreCell";

interface Props {
  gameUuid: string;
}

export const GameInfo: React.FC<Props> = ({ gameUuid }) => {
  const { data: game } = useGame(gameUuid);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>-</TableHead>
          {game.players.map((player) => (
            <TableHead
              className={player.seat === game.current_seat ? "bg-accent" : ""}
            >
              {player.player_uuid}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {CATEGORIES.map((category) => (
          <TableRow key={category}>
            <TableCell>{category}</TableCell>
            {game.players.map((player) => (
              <ScoreCell
                player={player}
                dice={game.dice}
                gameUuid={game.uuid}
                category={category}
                isMyTurn={game.is_my_turn}
                currentSeat={game.current_seat}
              />
            ))}
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          {game.players.map(() => (
            <TableCell>0</TableCell>
          ))}
        </TableRow>
      </TableFooter>
    </Table>
  );
};

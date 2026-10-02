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
import {
  LOWER_CATEGORIES,
  UPPER_CATEGORIES,
  type Category,
} from "@shared/types/gameCategories";
import {
  getScoreSummary,
  UPPER_BONUS_THRESHOLD,
  type ScoreSummary,
} from "@shared/helpers/getScoreSummary";
import { ScoreCell } from "./components/ScoreCell/ScoreCell";
import { CATEGORY_LABELS } from "./categoryLabels";
import { cn } from "@/lib/utils";
import type { ScoreSelection } from "../../types";

interface Props {
  gameUuid: string;
  selected: ScoreSelection | null;
  onSelect: (selection: ScoreSelection) => void;
}

export const GameInfo: React.FC<Props> = ({ gameUuid, selected, onSelect }) => {
  const { data: game } = useGame(gameUuid);

  const summaries = game.players.map(getScoreSummary);

  const renderCategoryRows = (categories: readonly Category[]) =>
    categories.map((category) => (
      <TableRow
        key={category}
        className={cn(selected?.category === category && "bg-muted/50")}
      >
        <TableCell className="pl-4">{CATEGORY_LABELS[category]}</TableCell>
        {game.players.map((player) => (
          <ScoreCell
            key={player.player_uuid}
            player={player}
            dice={game.dice}
            category={category}
            isSelected={selected?.category === category}
            onSelect={(score) => onSelect({ category, score })}
            isMyTurn={game.is_my_turn}
            currentSeat={game.current_seat}
          />
        ))}
      </TableRow>
    ));

  const renderSectionRow = (label: string) => (
    <TableRow className="bg-muted hover:bg-muted">
      <TableCell
        colSpan={game.players.length + 1}
        className="pl-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
      >
        {label}
      </TableCell>
    </TableRow>
  );

  const renderSummaryRow = (
    label: string,
    getValue: (summary: ScoreSummary) => React.ReactNode,
  ) => (
    <TableRow className="text-muted-foreground hover:bg-transparent">
      <TableCell className="pl-4">{label}</TableCell>
      {summaries.map((summary, i) => (
        <TableCell
          key={game.players[i].player_uuid}
          className="text-center tabular-nums"
        >
          {getValue(summary)}
        </TableCell>
      ))}
    </TableRow>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-full pl-4" />
          {game.players.map((player) => (
            <TableHead
              key={player.player_uuid}
              className={cn(
                "min-w-24 text-center",
                player.seat === game.current_seat && "bg-muted/60",
              )}
            >
              {player.display_name}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {renderSectionRow("Upper section")}
        {renderCategoryRows(UPPER_CATEGORIES)}
        {renderSummaryRow(
          "Sum",
          (summary) => `${summary.upper} / ${UPPER_BONUS_THRESHOLD}`,
        )}
        {renderSummaryRow("Bonus", (summary) => summary.bonus)}
        {renderSectionRow("Lower section")}
        {renderCategoryRows(LOWER_CATEGORIES)}
        {renderSummaryRow("Sum", (summary) => summary.lower)}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell className="pl-4 font-semibold">Total</TableCell>
          {summaries.map((summary, i) => (
            <TableCell
              key={game.players[i].player_uuid}
              className="text-center font-semibold tabular-nums"
            >
              {summary.total}
            </TableCell>
          ))}
        </TableRow>
      </TableFooter>
    </Table>
  );
};

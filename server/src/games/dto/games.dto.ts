import type { GameStatus } from "@shared/types/gameStatus";

export class GamesResponseDto {
  games: {
    uuid: string;
    owner_uuid: string;
    status: GameStatus;
    current_seat: number;
    dice: number[];
    rolls_used: number;
    round: number;
    is_owner: boolean;
    is_my_turn: boolean;
    created_at: string;
  }[];
}

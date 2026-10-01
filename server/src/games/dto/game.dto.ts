import type { GameStatus } from "@shared/types/gameStatus";

export class GameResponseDto {
  uuid: string;
  owner_uuid: string | number;
  status: GameStatus;
  current_seat: number;
  dice: number[];
  rolls_used: number;
  round: number;
  is_owner: boolean;
  is_my_turn: boolean;
  players: {
    player_uuid: string;
    game_uuid: string;
    seat: number;
    ones: number | null;
    twos: number | null;
    threes: number | null;
    fours: number | null;
    fives: number | null;
    sixes: number | null;
    one_pair: number | null;
    two_pairs: number | null;
    three_of_a_kind: number | null;
    four_of_a_kind: number | null;
    small_straight: number | null;
    large_straight: number | null;
    full_house: number | null;
    chance: number | null;
    yatzy: number | null;
  }[];
  finished_at: string | null;
  created_at: string;
}

import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PG_POOL } from "../db/db.module";
import { Pool } from "pg";
import { withTransaction } from "../hoc/withTransaction";
import { Queryable } from "../types/queryable";
import { randomInt } from "node:crypto";
import { CommitDto } from "./dto/commit.dto";
import { GameResponseDto } from "./dto/game.dto";
import { GamesResponseDto } from "./dto/games.dto";
import { getPossibleScores } from "@shared/helpers/getPossibleScores";
import { ERROR_CODE } from "@shared/types/error_code";

@Injectable()
export class GamesService {
  constructor(@Inject(PG_POOL) private db: Pool) {}

  async getGames(userUuid: string) {
    const { rows } = await this.db.query<GamesResponseDto["games"][number]>(
      `SELECT g.*,
              (g.owner_uuid IS NOT DISTINCT FROM $1::uuid) AS is_owner
         FROM games g
         JOIN game_players gp ON gp.game_uuid = g.uuid
        WHERE gp.player_uuid = $1
        ORDER BY g.created_at DESC`,
      [userUuid],
    );

    return rows;
  }

  async getGame(userUuid: string, gameUuid: string) {
    const { rows } = await this.db.query<GameResponseDto>(
      `SELECT g.*,
              (g.owner_uuid IS NOT DISTINCT FROM $2::uuid)             AS is_owner,
              (g.status = 'in_progress' AND me.seat = g.current_seat)  AS is_my_turn,
              (SELECT json_agg(
                        to_jsonb(gp) || jsonb_build_object('display_name', u.display_name)
                        ORDER BY gp.seat
                      )
                 FROM game_players gp
                 JOIN users u ON u.uuid = gp.player_uuid
                WHERE gp.game_uuid = g.uuid)                            AS players
         FROM games g
         JOIN game_players me ON me.game_uuid = g.uuid AND me.player_uuid = $2
        WHERE g.uuid = $1`,
      [gameUuid, userUuid],
    );

    const game = rows[0];

    if (!game) {
      throw new NotFoundException({
        message: "Game not found",
        code: ERROR_CODE.GAME_NOT_FOUND,
      });
    }

    return game;
  }

  async createGame(userUuid: string) {
    return withTransaction(this.db, async (client) => {
      const { rows } = await client.query(
        `INSERT INTO games (owner_uuid)
         VALUES ($1)
         RETURNING *, true AS is_owner`,
        [userUuid],
      );

      const game = rows[0];

      await this.insertGamePlayer(userUuid, game.uuid, client);

      return game;
    });
  }

  async startGame(userUuid: string, gameUuid: string) {
    await this.db.query(
      `UPDATE games SET status = 'in_progress' WHERE uuid = $1 AND owner_uuid = $2 AND status = 'waiting'`,
      [gameUuid, userUuid],
    );

    return true;
  }

  async joinGame(userUuid: string, gameUuid: string) {
    return withTransaction(this.db, async (client) => {
      return this.insertGamePlayer(userUuid, gameUuid, client);
    });
  }

  async insertGamePlayer(
    userUuid: string,
    gameUuid: string,
    client: Queryable = this.db,
  ) {
    try {
      const { rows: gameRows } = await client.query(
        `SELECT status FROM games WHERE uuid = $1 FOR UPDATE`,
        [gameUuid],
      );

      const game = gameRows[0];

      if (!game) {
        throw new NotFoundException({
          message: "Game not found",
          code: ERROR_CODE.GAME_NOT_FOUND,
        });
      }

      if (game.status !== "waiting") {
        throw new ConflictException({
          message: "Game is already in progress",
          code: ERROR_CODE.GAME_ALREADY_IN_PROGRESS,
        });
      }

      const { rows } = await client.query(
        `INSERT INTO game_players (player_uuid, game_uuid, seat)
        SELECT $1, $2, COALESCE(MAX(seat) + 1, 0)
          FROM game_players
        WHERE game_uuid = $2
        RETURNING *`,
        [userUuid, gameUuid],
      );

      return rows[0];
    } catch (e: any) {
      if (e.code === "23505" && e.constraint === "game_players_pkey") {
        throw new ConflictException({
          message: "You already joined this game",
          code: ERROR_CODE.ALREADY_JOINED,
        });
      }

      throw e;
    }
  }

  async roll(input: { userUuid: string; gameUuid: string; keep: number[] }) {
    return withTransaction(this.db, async (client) => {
      const { rows } = await client.query(
        `SELECT g.status, g.dice, g.rolls_used, g.current_seat, gp.seat
           FROM games g
           JOIN game_players gp ON gp.game_uuid = g.uuid AND gp.player_uuid = $2
          WHERE g.uuid = $1
          FOR UPDATE OF g`,
        [input.gameUuid, input.userUuid],
      );

      const game = rows[0];

      if (!game) {
        throw new NotFoundException({
          message: "Game not found",
          code: ERROR_CODE.GAME_NOT_FOUND,
        });
      }

      if (game.status !== "in_progress") {
        throw new ConflictException({
          message: "Game is not in progress",
          code: ERROR_CODE.GAME_NOT_IN_PROGRESS,
        });
      }

      if (game.seat !== game.current_seat) {
        throw new ConflictException({
          message: "Not your turn",
          code: ERROR_CODE.NOT_YOUR_TURN,
        });
      }

      if (game.rolls_used >= 3) {
        throw new ConflictException({
          message: "No rolls left",
          code: ERROR_CODE.NO_ROLLS_LEFT,
        });
      }

      if (game.rolls_used === 0 && input.keep.length > 0) {
        throw new BadRequestException({
          message: "Nothing to keep before the first roll",
          code: ERROR_CODE.NOTHING_TO_KEEP,
        });
      }

      const first = game.rolls_used === 0;
      const dice: number[] = first
        ? Array.from({ length: 5 }, () => randomInt(1, 7))
        : game.dice.map((d: number, i: number) =>
            input.keep.includes(i) ? d : randomInt(1, 7),
          );

      const updated = await client.query(
        `UPDATE games SET dice = $2, rolls_used = rolls_used + 1
          WHERE uuid = $1
          RETURNING dice, rolls_used`,
        [input.gameUuid, dice],
      );

      return updated.rows[0];
    });
  }

  async commit(userUuid: string, gameUuid: string, commitDto: CommitDto) {
    return withTransaction(this.db, async (client) => {
      const { rows } = await client.query(
        `SELECT g.status, g.dice, g.rolls_used, g.current_seat, g.round, gp.seat
           FROM games g
           JOIN game_players gp ON gp.game_uuid = g.uuid AND gp.player_uuid = $2
          WHERE g.uuid = $1
          FOR UPDATE OF g`,
        [gameUuid, userUuid],
      );
      const game = rows[0];

      if (!game)
        throw new NotFoundException({
          message: "Game not found",
          code: ERROR_CODE.GAME_NOT_FOUND,
        });
      if (game.status !== "in_progress")
        throw new ConflictException({
          message: "Game is not in progress",
          code: ERROR_CODE.GAME_NOT_IN_PROGRESS,
        });
      if (game.seat !== game.current_seat)
        throw new ConflictException({
          message: "Not your turn",
          code: ERROR_CODE.NOT_YOUR_TURN,
        });
      if (game.rolls_used === 0)
        throw new ConflictException({
          message: "Roll the dice first",
          code: ERROR_CODE.NOT_ROLLED,
        });

      if (
        !getPossibleScores(commitDto.category, game.dice).includes(
          commitDto.score,
        )
      ) {
        throw new BadRequestException({
          message: "Invalid score for these dice",
          code: ERROR_CODE.INVALID_SCORE,
        });
      }

      const result = await client.query(
        `UPDATE game_players SET "${commitDto.category}" = $3
          WHERE game_uuid = $1 AND player_uuid = $2 AND "${commitDto.category}" IS NULL`,
        [gameUuid, userUuid, commitDto.score],
      );
      if (result.rowCount === 0) {
        throw new ConflictException({
          message: "Category already used",
          code: ERROR_CODE.CATEGORY_TAKEN,
        });
      }

      const { rows: seatRows } = await client.query<{
        next_seat: number | null;
        first_seat: number;
      }>(
        `SELECT
           (SELECT MIN(seat) FROM game_players WHERE game_uuid = $1 AND seat > $2) AS next_seat,
           (SELECT MIN(seat) FROM game_players WHERE game_uuid = $1)              AS first_seat`,
        [gameUuid, game.seat],
      );
      const { next_seat, first_seat } = seatRows[0];

      const wrapped = next_seat === null;
      const nextSeat = wrapped ? first_seat : next_seat;
      const finished = wrapped && game.round >= 15;
      const nextRound = wrapped && !finished ? game.round + 1 : game.round;

      const { rows: updated } = await client.query(
        `UPDATE games
            SET dice         = '{}',
                rolls_used   = 0,
                current_seat = $2,
                round        = $3,
                status       = CASE WHEN $4 THEN 'finished' ELSE status END,
                finished_at  = CASE WHEN $4 THEN now() ELSE finished_at END
          WHERE uuid = $1
          RETURNING status, round, current_seat, dice, rolls_used`,
        [gameUuid, nextSeat, nextRound, finished],
      );

      return {
        category: commitDto.category,
        points: commitDto.score,
        game: updated[0],
      };
    });
  }
}

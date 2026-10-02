import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  ParseUUIDPipe,
  Post,
  MessageEvent,
  Sse,
} from "@nestjs/common";
import { GamesService } from "./games.service";
import { CurrentUser } from "../decorators/currentUser";
import { RollDto } from "./dto/roll.dto";
import { CommitDto } from "./dto/commit.dto";
import type { User } from "@/types/user";
import { GamesResponseDto } from "./dto/games.dto";
import { GameResponseDto } from "./dto/game.dto";
import { defer, Observable, switchMap } from "rxjs";
import { EventsService } from "@/events/events.service";
import { topics } from "@shared/types/events";
import { ERROR_CODE } from "@shared/types/error_code";

@Controller("games")
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly events: EventsService,
  ) {}

  @Get("")
  async getGames(@CurrentUser() user: User): Promise<GamesResponseDto> {
    const games = await this.gamesService.getGames(user.sub);

    return { games };
  }

  @Post("create")
  async create(@CurrentUser() user: User) {
    const game = await this.gamesService.createGame(user.sub);

    if (!game) {
      throw new InternalServerErrorException({
        message: "Something went wrong with game",
        code: ERROR_CODE.GAME_CREATE_FAILED,
      });
    }

    this.events.publish(topics.user(user.sub), "user:games_updated", {});

    return game;
  }

  @Sse("subscribe")
  subscribeToGames(@CurrentUser() user: User): Observable<MessageEvent> {
    return this.events.stream(topics.user(user.sub));
  }

  @Get(":gameUuid")
  async getGame(
    @CurrentUser() user: User,
    @Param("gameUuid", ParseUUIDPipe) gameUuid: string,
  ): Promise<GameResponseDto> {
    const game = await this.gamesService.getGame(user.sub, gameUuid);

    return game;
  }

  @Post(":gameUuid/start")
  @HttpCode(HttpStatus.OK)
  async start(
    @CurrentUser() user: User,
    @Param("gameUuid", ParseUUIDPipe) gameUuid: string,
  ) {
    this.events.publish(topics.game(gameUuid), "game:updated", { gameUuid });

    return await this.gamesService.startGame(user.sub, gameUuid);
  }

  @Post(":gameUuid/join")
  async join(
    @CurrentUser() user: User,
    @Param("gameUuid", ParseUUIDPipe) gameUuid: string,
  ) {
    this.events.publish(topics.game(gameUuid), "game:updated", { gameUuid });

    const player = await this.gamesService.joinGame(user.sub, gameUuid);

    if (!player) {
      throw new InternalServerErrorException({
        message: "Something went wrong with game player",
        code: ERROR_CODE.GAME_JOIN_FAILED,
      });
    }
  }

  @Post(":gameUuid/roll")
  async roll(
    @CurrentUser() user: User,
    @Param("gameUuid", ParseUUIDPipe) gameUuid: string,
    @Body() body: RollDto,
  ) {
    await this.gamesService.roll({
      userUuid: user.sub,
      gameUuid,
      keep: body?.keep ?? [],
    });

    this.events.publish(topics.game(gameUuid), "game:updated", { gameUuid });
  }

  @Post(":gameUuid/commit")
  async commit(
    @CurrentUser() user: User,
    @Param("gameUuid", ParseUUIDPipe) gameUuid: string,
    @Body() body: CommitDto,
  ) {
    await this.gamesService.commit(user.sub, gameUuid, body);

    this.events.publish(topics.game(gameUuid), "game:updated", { gameUuid });
  }

  @Sse(":gameUuid/subscribe")
  subscribeToGame(
    @CurrentUser() user: User,
    @Param("gameUuid", ParseUUIDPipe) gameUuid: string,
  ): Observable<MessageEvent> {
    return defer(() => this.gamesService.getGame(user.sub, gameUuid)).pipe(
      switchMap(() => this.events.stream(topics.game(gameUuid))),
    );
  }
}

export const GAME_STATUS = {
  WAITING: "waiting",
  IN_PROGRESS: "in_progress",
  FINISHED: "finished",
} as const;

export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];

export type EventMap = {
  "game:updated": { gameUuid: string };
  "user:games_updated": {};
};

export type EventType = keyof EventMap;

export const topics = {
  game: (gameUuid: string) => `game:${gameUuid}`,
  user: (userUuid: string) => `user:${userUuid}`,
};

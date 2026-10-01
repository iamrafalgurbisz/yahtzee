export type EventMap = {
  "game:updated": { gameUuid: string };
};

export type EventType = keyof EventMap;

export const topics = {
  game: (gameUuid: string) => `game:${gameUuid}`,
  user: (userUuid: string) => `user:${userUuid}`,
};

export const QUERY_KEYS = {
  me: () => ["me"] as const,
  verifyEmail: (token: string) => ["verifyEmail", token] as const,
  games: {
    all: () => ["games"] as const,
    one: (gameUuid: string) => ["games", "one", gameUuid] as const,
  },
};

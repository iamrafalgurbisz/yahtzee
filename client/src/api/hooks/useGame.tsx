import { useSuspenseQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../queryKeys";
import { api } from "../api";
import type { GameResponseDto } from "@/@types/apiTypes";

export const useGame = (gameUuid: string) => {
  return useSuspenseQuery({
    queryKey: QUERY_KEYS.games.one(gameUuid),
    queryFn: () =>
      api
        .get<GameResponseDto>(`/api/games/${gameUuid}`)
        .then((res) => res.data),
  });
};

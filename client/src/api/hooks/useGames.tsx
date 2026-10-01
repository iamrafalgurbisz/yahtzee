import { useSuspenseQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../queryKeys";
import { api } from "../api";
import type { GamesResponseDto } from "@/@types/apiTypes";

export const useGames = () => {
  return useSuspenseQuery({
    queryKey: QUERY_KEYS.games.all(),
    queryFn: () =>
      api.get<GamesResponseDto>("/api/games").then((res) => res.data),
  });
};

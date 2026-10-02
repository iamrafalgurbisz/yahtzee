import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { QUERY_KEYS } from "../queryKeys";

export const useRoll = (gameUuid: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ keep }: { keep: number[] }) =>
      api.post(`/api/games/${gameUuid}/roll`, { keep }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: QUERY_KEYS.games.one(gameUuid) }),
  });
};

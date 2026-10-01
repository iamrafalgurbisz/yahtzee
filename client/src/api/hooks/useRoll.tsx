import { useMutation } from "@tanstack/react-query";
import { api } from "../api";

export const useRoll = (gameUuid: string) => {
  return useMutation({
    mutationFn: ({ keep }: { keep: number[] }) =>
      api.post(`/api/games/${gameUuid}/roll`, { keep }),
  });
};

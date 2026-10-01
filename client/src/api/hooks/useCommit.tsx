import { useMutation } from "@tanstack/react-query";
import { api } from "../api";
import type { Category } from "@shared/types/gameCategories";

export const useCommit = (gameUuid: string) => {
  return useMutation({
    mutationFn: ({ category, score }: { category: Category; score: number }) =>
      api.post(`/api/games/${gameUuid}/commit`, { category, score }),
  });
};

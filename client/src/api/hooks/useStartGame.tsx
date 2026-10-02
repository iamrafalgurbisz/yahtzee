import { useMutation } from "@tanstack/react-query";
import { api } from "../api";
import { toast } from "@/components/ui/toast";

export const useStartGame = (gameUuid: string) => {
  return useMutation({
    mutationFn: () => api.post(`/api/games/${gameUuid}/start`),
    onSuccess: () => {
      toast.add({ title: "Game was started." });
    },
  });
};

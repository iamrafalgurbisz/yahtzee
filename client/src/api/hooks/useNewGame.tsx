import { useMutation } from "@tanstack/react-query";
import { api } from "../api";
import { toast } from "@/components/ui/toast";

export const useNewGame = () => {
  return useMutation({
    mutationFn: () => api.post("/api/games/create"),
    onSuccess: () => {
      toast.add({ title: "Game was created." });
    },
  });
};

import { useMutation } from "@tanstack/react-query";
import { api } from "../api";
import { redirect, useNavigate } from "react-router";
import { toast } from "@/components/ui/toast";
import type { AxiosError } from "axios";

export const useJoinGame = (uuid: string) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => api.post(`/api/games/${uuid}/join`),
    onSuccess: () => {
      toast.add({ title: "Successfully joined the game.", type: "error" });

      redirect(`/game/${uuid}`);
    },
    onError: (e: AxiosError) => {
      console.log(e.response);
      if (e.response?.status === 409) {
        toast.add({ title: "You already joined this game." });
        navigate(`/games/${uuid}`);
      } else {
        toast.add({ title: "Could not join the game.", type: "error" });
      }
    },
  });
};

import { useMutation } from "@tanstack/react-query";
import { api, getApiError } from "../api";
import { useNavigate } from "react-router";
import { toast } from "@/components/ui/toast";
import { ERROR_CODE } from "@shared/types/error_code";

export const useJoinGame = (uuid: string) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => api.post(`/api/games/${uuid}/join`),
    onSuccess: () => {
      toast.add({ title: "Successfully joined the game.", type: "success" });

      navigate(`/games/${uuid}`, { replace: true });
    },
    onError: (e) => {
      const { code } = getApiError(e);

      if (code === ERROR_CODE.ALREADY_JOINED) {
        toast.add({ title: "You already joined this game." });
        navigate(`/games/${uuid}`, { replace: true });
      } else if (code === ERROR_CODE.GAME_ALREADY_IN_PROGRESS) {
        toast.add({ title: "This game has already started.", type: "error" });
        navigate("/games", { replace: true });
      } else {
        toast.add({ title: "Could not join the game.", type: "error" });
        navigate("/games", { replace: true });
      }
    },
  });
};

import { useQueryClient } from "@tanstack/react-query";
import { useEventSource } from "./useEventSource";
import { QUERY_KEYS } from "../queryKeys";

export function useGamesSubscription() {
  const qc = useQueryClient();

  useEventSource(`/api/games/subscribe`, {
    "user:games_updated": () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.games.all() });
    },
  });
}

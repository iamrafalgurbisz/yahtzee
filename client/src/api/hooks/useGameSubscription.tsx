import { useQueryClient } from "@tanstack/react-query";
import { useEventSource } from "./useEventSource";
import { QUERY_KEYS } from "../queryKeys";

export function useGameSubscription(gameUuid: string) {
  const qc = useQueryClient();

  useEventSource(`/api/games/${gameUuid}/subscribe`, {
    "game:updated": () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.games.one(gameUuid) });
    },
  });
}

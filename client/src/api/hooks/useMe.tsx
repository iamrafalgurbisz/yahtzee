import { useSuspenseQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../queryKeys";
import { api } from "../api";
import type { MeResponseDto } from "@/@types/apiTypes";

export const useMe = () => {
  return useSuspenseQuery<MeResponseDto>({
    queryKey: QUERY_KEYS.me(),
    queryFn: () => api.get("/api/auth/me"),
  });
};

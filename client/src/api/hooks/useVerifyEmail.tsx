import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../queryKeys";
import { api } from "../api";
import type { VerifyEmailDto } from "@/@types/apiTypes";

export const useVerifyEmail = (token: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.verifyEmail(token),
    queryFn: async () => {
      await api.post("/api/auth/verify-email", {
        token,
      } satisfies VerifyEmailDto);

      return true;
    },
    enabled: !!token,
    retry: false,
  });
};

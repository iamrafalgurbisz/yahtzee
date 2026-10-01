import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../queryKeys";
import { api } from "../api";

export const useLogin = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.post("/api/auth/login", { email, password }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.me() }),
  });
};

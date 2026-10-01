import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

export const useLogout = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => api.post("/api/auth/logout"),
    onSuccess: () => qc.invalidateQueries(),
  });
};

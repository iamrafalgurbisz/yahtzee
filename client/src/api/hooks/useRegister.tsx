import { useMutation } from "@tanstack/react-query";
import { api } from "../api";
import type { RegisterDto } from "@/@types/apiTypes";

export const useRegister = () => {
  return useMutation({
    mutationFn: ({
      displayName,
      email,
      password,
    }: {
      displayName: string;
      email: string;
      password: string;
    }) =>
      api.post("/api/auth/register", {
        display_name: displayName,
        email,
        password,
      } satisfies RegisterDto),
  });
};

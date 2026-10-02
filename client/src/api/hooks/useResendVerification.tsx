import { useMutation } from "@tanstack/react-query";
import { api } from "../api";
import type { ResendVerificationDto } from "@/@types/apiTypes";

export const useResendVerification = () => {
  return useMutation({
    mutationFn: (email: string) =>
      api.post("/api/auth/resend-verification", {
        email,
      } satisfies ResendVerificationDto),
  });
};

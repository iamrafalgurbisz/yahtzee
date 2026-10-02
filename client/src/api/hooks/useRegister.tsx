import { useMutation } from "@tanstack/react-query";
import { api } from "../api";
import { toast } from "@/components/ui/toast";
import { useNavigate } from "react-router";
import type { RegisterDto } from "@/@types/apiTypes";

export const useRegister = () => {
  const navigate = useNavigate();

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
    onSuccess: () => {
      toast.add({ title: "Account created successfully. You can now log in." });
      navigate("/games");
    },
  });
};

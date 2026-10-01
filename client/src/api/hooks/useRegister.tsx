import { useMutation } from "@tanstack/react-query";
import { api } from "../api";
import { toast } from "@/components/ui/toast";
import { useNavigate } from "react-router";

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
    }) => api.post("/api/auth/register", { displayName, email, password }),
    onSuccess: () => {
      toast.add({ title: "Account created successfully. You can now log in." });
      navigate("/games");
    },
  });
};

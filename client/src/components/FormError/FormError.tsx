import type React from "react";
import { CircleAlertIcon } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";

export const FormError: React.FC<{ message: string }> = ({ message }) => {
  return (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertTitle>{message}</AlertTitle>
    </Alert>
  );
};

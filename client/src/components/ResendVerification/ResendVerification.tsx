import { useResendVerification } from "@/api/hooks/useResendVerification";
import { FormField } from "@/components/FormField/FormField";
import { FormError } from "@/components/FormError/FormError";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { CircleCheckIcon } from "lucide-react";
import type { SubmitEvent } from "react";

export const ResendVerification = ({ email }: { email?: string }) => {
  const resend = useResendVerification();

  const onSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    resend.mutate(email ?? (formData.get("email") as string));
  };

  if (resend.isSuccess) {
    return (
      <Alert>
        <CircleCheckIcon />
        <AlertTitle>
          If the account needs activation, a new link has been sent.
        </AlertTitle>
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {!email && <FormField name="email" label="Email" type="email" required />}
      {resend.isError && (
        <FormError message="Could not send the link. Try again later." />
      )}
      <Button
        type="submit"
        variant={email ? "outline" : "default"}
        size="lg"
        disabled={resend.isPending}
      >
        Resend activation link
      </Button>
    </form>
  );
};

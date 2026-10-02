import type { SubmitEvent } from "react";
import { Link } from "react-router";
import { useLogin } from "../../api/hooks/useLogin";
import { getApiError } from "@/api/api";
import { ResendVerification } from "@/components/ResendVerification/ResendVerification";
import { AuthCard } from "@/components/AuthCard/AuthCard";
import { FormField } from "@/components/FormField/FormField";
import { FormError } from "@/components/FormError/FormError";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MailIcon } from "lucide-react";
import { ERROR_CODE } from "@shared/types/error_code";

export const LoginPage = () => {
  const login = useLogin();

  const onSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    login.mutate({ email, password });
  };

  const error = login.isError ? getApiError(login.error) : null;

  return (
    <AuthCard
      title="Log in"
      description="Welcome back to Yahtzee."
      footer={
        <span>
          Don't have an account?{" "}
          <Link to="/register" className="text-foreground underline">
            Sign up
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="grid gap-4">
        <FormField name="email" label="Email" type="email" required />
        <FormField name="password" label="Password" type="password" required />
        {error?.code === ERROR_CODE.EMAIL_NOT_VERIFIED ? (
          <Alert>
            <MailIcon />
            <AlertTitle>Your account is not activated yet</AlertTitle>
            <AlertDescription>
              Check your inbox for the activation link.
            </AlertDescription>
          </Alert>
        ) : (
          error && <FormError message={error.message} />
        )}
        <Button type="submit" size="lg" disabled={login.isPending}>
          Log in
        </Button>
      </form>
      {error?.code === ERROR_CODE.EMAIL_NOT_VERIFIED && (
        <div className="mt-2">
          <ResendVerification email={login.variables?.email} />
        </div>
      )}
    </AuthCard>
  );
};

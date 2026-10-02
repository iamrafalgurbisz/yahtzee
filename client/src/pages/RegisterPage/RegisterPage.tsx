import { useRegister } from "@/api/hooks/useRegister";
import { getApiError } from "@/api/api";
import { ResendVerification } from "@/components/ResendVerification/ResendVerification";
import { AuthCard } from "@/components/AuthCard/AuthCard";
import { FormField } from "@/components/FormField/FormField";
import { FormError } from "@/components/FormError/FormError";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import type { SubmitEvent } from "react";

export const RegisterPage = () => {
  const register = useRegister();

  const onSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const displayName = formData.get("displayName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    register.mutate({ displayName, email, password });
  };

  if (register.isSuccess) {
    const { email } = register.variables;

    return (
      <AuthCard
        title="Check your inbox"
        description={
          <>
            We sent an activation link to{" "}
            <span className="font-medium text-foreground">{email}</span>.
          </>
        }
        footer={
          <Link to="/login" className="text-foreground underline">
            Back to log in
          </Link>
        }
      >
        <ResendVerification email={email} />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create an account"
      description="Sign up to start playing."
      footer={
        <span>
          Already have an account?{" "}
          <Link to="/login" className="text-foreground underline">
            Log in
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="grid gap-4">
        <FormField
          name="displayName"
          label="Display name"
          minLength={5}
          maxLength={20}
          required
        />
        <FormField name="email" label="Email" type="email" required />
        <FormField
          name="password"
          label="Password"
          type="password"
          minLength={8}
          maxLength={128}
          required
        />
        {register.isError && (
          <FormError message={getApiError(register.error).message} />
        )}
        <Button type="submit" size="lg" disabled={register.isPending}>
          Sign up
        </Button>
      </form>
    </AuthCard>
  );
};

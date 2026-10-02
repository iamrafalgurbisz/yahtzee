import { useVerifyEmail } from "@/api/hooks/useVerifyEmail";
import { ResendVerification } from "@/components/ResendVerification/ResendVerification";
import { AuthCard } from "@/components/AuthCard/AuthCard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useSearchParams } from "react-router";

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const verify = useVerifyEmail(token);

  if (token && verify.isPending) {
    return <AuthCard title="Activating your account..." />;
  }

  if (verify.isSuccess) {
    return (
      <AuthCard
        title="Account activated"
        description="You can now log in and start playing."
      >
        <Link to="/login" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
          Log in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Link invalid or expired"
      description="Enter your email and we'll send you a new activation link."
    >
      <ResendVerification />
    </AuthCard>
  );
};

import { useRegister } from "@/api/hooks/useRegister";
import type { SubmitEvent } from "react";

export const RegisterPage = () => {
  const register = useRegister();

  const onSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const displayName = formData.get("displayName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    register.mutateAsync({ displayName, email, password });
  };

  return (
    <div>
      Login
      <form onSubmit={onSubmit}>
        <input name="displayName" type="text" placeholder="display name" />
        <input name="email" type="email" placeholder="email" />
        <input name="password" type="password" placeholder="password" />
        <button type="submit" value="Submit">
          Submit
        </button>
      </form>
    </div>
  );
};

import type { SubmitEvent } from "react";
import { useLogin } from "../../api/hooks/useLogin";

export const LoginPage = () => {
  const login = useLogin();

  const onSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    login.mutateAsync({ email, password });
  };

  return (
    <div>
      Login
      <form onSubmit={onSubmit}>
        <input name="email" type="email" placeholder="email" />
        <input name="password" type="password" placeholder="password" />
        <button type="submit" value="Submit">
          Submit
        </button>
      </form>
    </div>
  );
};

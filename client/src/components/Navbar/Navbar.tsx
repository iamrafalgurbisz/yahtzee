import { useLogout } from "../../api/hooks/useLogout";

export const Navbar = () => {
  const logout = useLogout();

  const onLogout = () => {
    logout.mutateAsync();
  };

  return (
    <div>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
};

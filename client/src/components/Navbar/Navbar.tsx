import { Link } from "react-router";
import { LogOutIcon } from "lucide-react";
import { useLogout } from "../../api/hooks/useLogout";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  const logout = useLogout();

  const onLogout = () => {
    logout.mutateAsync();
  };

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/games" className="font-semibold">
          Yahtzee
        </Link>
        <Button variant="ghost" onClick={onLogout}>
          <LogOutIcon />
          Log out
        </Button>
      </div>
    </header>
  );
};

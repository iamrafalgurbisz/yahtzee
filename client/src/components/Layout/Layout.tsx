import { Outlet } from "react-router";
import { Navbar } from "../Navbar/Navbar";
import { Toaster } from "../ui/toast";

export const Layout = () => {
  return (
    <div>
      <Toaster />
      <Navbar />
      <Outlet />
    </div>
  );
};

import { Outlet } from "react-router";
import { Navbar } from "../Navbar/Navbar";
import { Toaster } from "../ui/toast";

export const Layout = () => {
  return (
    <div className="min-h-svh">
      <Toaster />
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

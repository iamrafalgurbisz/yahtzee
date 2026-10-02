import { Navigate, Outlet, useLocation } from "react-router";
import { useMe } from "../api/hooks/useMe";

function FullPageLoader() {
  return <p style={{ padding: 24 }}>Ładowanie...</p>;
}

export function RequireAuth() {
  const { data: me, isPending, isError } = useMe();
  const location = useLocation();

  if (isPending) return <FullPageLoader />;
  if (!me || isError) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function RedirectIfAuthenticated() {
  const { data: me, isPending } = useMe();
  const location = useLocation();

  const from = (location.state as { from?: string } | null)?.from ?? "/games";

  if (isPending) return <FullPageLoader />;
  if (me) return <Navigate to={from} replace />;

  return <Outlet />;
}

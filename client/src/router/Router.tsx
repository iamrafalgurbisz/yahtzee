import { createBrowserRouter, Navigate } from "react-router";
import { LoginPage } from "../pages/LoginPage/LoginPage";
import { RedirectIfAuthenticated, RequireAuth } from "../auth/authGuards";
import { NotFoundPage } from "../pages/NotFoundPage/NotFoundPage";
import { Layout } from "../components/Layout/Layout";
import { GamesPage } from "../pages/GamesPage/GamesPage";
import { GamePage } from "../pages/GamePage/GamePage";
import { JoinGamePage } from "@/pages/JoinGamePage/JoinGamePage";
import { RegisterPage } from "@/pages/RegisterPage/RegisterPage";
import { VerifyEmailPage } from "@/pages/VerifyEmailPage/VerifyEmailPage";
import { GameErrorPage } from "@/pages/GameErrorPage/GameErrorPage";

export const router = createBrowserRouter([
  {
    element: <RedirectIfAuthenticated />,
    children: [
      { path: "/", element: <Navigate to="/login" replace /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/", element: <Navigate to="/games" replace /> },
          { path: "/games", element: <GamesPage /> },
          {
            path: "/games/:uuid",
            element: <GamePage />,
            errorElement: <GameErrorPage />,
          },
          { path: "/games/:uuid/join", element: <JoinGamePage /> },
        ],
      },
    ],
  },
  { path: "/verify-email", element: <VerifyEmailPage /> },
  { path: "*", element: <NotFoundPage /> },
]);

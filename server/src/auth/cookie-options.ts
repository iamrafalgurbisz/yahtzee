import type { CookieOptions } from "express";

export const COOKIE_OPTS: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

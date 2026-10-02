import type { components } from "@shared/api";

type Schemas = components["schemas"];

export type MeResponseDto = Schemas["MeResponseDto"];
export type LoginDto = Schemas["LoginDto"];
export type RegisterDto = Schemas["RegisterDto"];
export type VerifyEmailDto = Schemas["VerifyEmailDto"];
export type ResendVerificationDto = Schemas["ResendVerificationDto"];
export type GameResponseDto = Schemas["GameResponseDto"];
export type GamesResponseDto = Schemas["GamesResponseDto"];
export type GamesItemResponseDto = Schemas["GamesResponseDto"]["games"][number];

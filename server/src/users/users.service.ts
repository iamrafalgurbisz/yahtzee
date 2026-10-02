import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { PG_POOL } from "../db/db.module";
import { Pool } from "pg";
import { createHash, randomBytes } from "node:crypto";
import { ERROR_CODE } from "@shared/types/error_code";
import { Queryable } from "../types/queryable";

export type EmailTokenPurpose = "email_verification" | "password_reset";

const EMAIL_TOKEN_TTL: Record<EmailTokenPurpose, string> = {
  email_verification: "24 hours",
  password_reset: "1 hour",
};

@Injectable()
export class UsersService {
  constructor(@Inject(PG_POOL) private db: Pool) {}

  #sha(s: string) {
    return createHash("sha256").update(s).digest("hex");
  }

  async issue(uuid: string) {
    const refreshToken = randomBytes(32).toString("base64url");

    await this.db.query(
      `INSERT INTO refresh_tokens (token_hash, user_uuid, expires_at)
       VALUES ($1, $2, now() + interval '30 days')`,
      [this.#sha(refreshToken), uuid],
    );

    return refreshToken;
  }

  async consume(token: string) {
    const { rows } = await this.db.query<{ user_uuid: string }>(
      `DELETE FROM refresh_tokens
        WHERE token_hash = $1 AND expires_at > now()
        RETURNING user_uuid`,
      [this.#sha(token)],
    );

    return rows[0]?.user_uuid ?? null;
  }

  async findByEmailWithHash(email: string) {
    const { rows } = await this.db.query<{
      uuid: string;
      email: string;
      password_hash: string;
      email_verified_at: Date | null;
    }>(
      `SELECT u.uuid, u.email, u.email_verified_at, c.password_hash
           FROM users u
           JOIN user_credentials c ON c.user_uuid = u.uuid
          WHERE lower(u.email) = lower($1)`,
      [email],
    );

    return rows[0] ?? null;
  }

  async create(
    displayName: string,
    email: string,
    passwordHash: string,
    client: Queryable = this.db,
  ) {
    try {
      const { rows } = await client.query<{
        uuid: string;
        email: string;
        display_name: string;
      }>(
        `INSERT INTO users (display_name, email) VALUES ($1, $2)
         RETURNING uuid, email, display_name`,
        [displayName.trim(), email.trim()],
      );

      await client.query(
        "INSERT INTO user_credentials (user_uuid, password_hash) VALUES ($1, $2)",
        [rows[0].uuid, passwordHash],
      );

      return rows[0];
    } catch (e: any) {
      if (e.code === "23505") {
        throw new ConflictException({
          message: "This email is already taken",
          code: ERROR_CODE.EMAIL_TAKEN,
        });
      }

      throw e;
    }
  }

  async findUnverifiedByEmail(email: string) {
    const { rows } = await this.db.query<{
      uuid: string;
      email: string;
      display_name: string;
    }>(
      `SELECT uuid, email, display_name
         FROM users
        WHERE lower(email) = lower($1) AND email_verified_at IS NULL`,
      [email],
    );

    return rows[0] ?? null;
  }

  async issueEmailToken(
    uuid: string,
    purpose: EmailTokenPurpose,
    client: Queryable = this.db,
  ) {
    const token = randomBytes(32).toString("base64url");

    await client.query(
      "DELETE FROM email_tokens WHERE user_uuid = $1 AND purpose = $2",
      [uuid, purpose],
    );

    await client.query(
      `INSERT INTO email_tokens (token_hash, user_uuid, purpose, expires_at)
       VALUES ($1, $2, $3, now() + $4::interval)`,
      [this.#sha(token), uuid, purpose, EMAIL_TOKEN_TTL[purpose]],
    );

    return token;
  }

  async consumeEmailToken(
    token: string,
    purpose: EmailTokenPurpose,
    client: Queryable = this.db,
  ) {
    const { rows } = await client.query<{ user_uuid: string }>(
      `DELETE FROM email_tokens
        WHERE token_hash = $1 AND purpose = $2 AND expires_at > now()
        RETURNING user_uuid`,
      [this.#sha(token), purpose],
    );

    return rows[0]?.user_uuid ?? null;
  }

  async markEmailVerified(uuid: string, client: Queryable = this.db) {
    await client.query(
      `UPDATE users SET email_verified_at = now()
        WHERE uuid = $1 AND email_verified_at IS NULL`,
      [uuid],
    );
  }
}

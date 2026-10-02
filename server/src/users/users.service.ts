import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { PG_POOL } from "../db/db.module";
import { Pool } from "pg";
import { createHash, randomBytes } from "node:crypto";
import { ERROR_CODE } from "@shared/types/error_code";

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
    }>(
      `SELECT u.uuid, u.email, c.password_hash
           FROM users u
           JOIN user_credentials c ON c.user_uuid = u.uuid
          WHERE lower(u.email) = lower($1)`,
      [email],
    );

    return rows[0] ?? null;
  }

  async create(displayName: string, email: string, passwordHash: string) {
    const client = await this.db.connect();

    try {
      await client.query("BEGIN");

      const { rows } = await client.query<{ uuid: string; email: string }>(
        "INSERT INTO users (display_name, email) VALUES ($1, $2) RETURNING uuid, email",
        [displayName.trim(), email.trim()],
      );

      await client.query(
        "INSERT INTO user_credentials (user_uuid, password_hash) VALUES ($1, $2)",
        [rows[0].uuid, passwordHash],
      );

      await client.query("COMMIT");

      return rows[0];
    } catch (e: any) {
      await client.query("ROLLBACK");

      if (e.code === "23505") {
        throw new ConflictException({
          message: "This email is already taken",
          code: ERROR_CODE.EMAIL_TAKEN,
        });
      }

      throw e;
    } finally {
      client.release();
    }
  }
}

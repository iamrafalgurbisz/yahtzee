/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.sql(`
    ALTER TABLE "users" ADD COLUMN "email_verified_at" TIMESTAMPTZ;

    UPDATE "users" SET "email_verified_at" = "created_at";

    CREATE TABLE "email_tokens" (
      "token_hash" TEXT PRIMARY KEY,
      "user_uuid"  UUID NOT NULL REFERENCES "users"("uuid") ON DELETE CASCADE,
      "purpose"    TEXT NOT NULL
                   CHECK ("purpose" IN ('email_verification', 'password_reset')),
      "expires_at" TIMESTAMPTZ NOT NULL,
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX "email_tokens_user_uuid_purpose_idx"
      ON "email_tokens" ("user_uuid", "purpose");
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE "email_tokens";

    ALTER TABLE "users" DROP COLUMN "email_verified_at";
  `);
};

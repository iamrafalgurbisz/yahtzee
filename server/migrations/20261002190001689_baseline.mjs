/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS "users" (
      "uuid"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "display_name" TEXT NOT NULL,
      "email"        TEXT NOT NULL,
      "created_at"   TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "users_email_lower_idx"
      ON "users" (lower("email"));

    CREATE TABLE IF NOT EXISTS "user_credentials" (
      "user_uuid"     UUID PRIMARY KEY
                      REFERENCES "users"("uuid") ON DELETE CASCADE,
      "password_hash" TEXT NOT NULL,
      "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS "refresh_tokens" (
      "token_hash" TEXT PRIMARY KEY,
      "user_uuid"  UUID NOT NULL REFERENCES "users"("uuid") ON DELETE CASCADE,
      "expires_at" TIMESTAMPTZ NOT NULL,
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "refresh_tokens_user_uuid_idx"
      ON "refresh_tokens" ("user_uuid");

    CREATE TABLE IF NOT EXISTS "games" (
      "uuid"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "owner_uuid"  UUID REFERENCES "users"("uuid") ON DELETE SET NULL,
      "status"      TEXT NOT NULL DEFAULT 'waiting'
                    CHECK ("status" IN ('waiting', 'in_progress', 'finished')),
        "round"        SMALLINT NOT NULL DEFAULT 1 CHECK ("round" BETWEEN 1 AND 15),
        "current_seat" SMALLINT NOT NULL DEFAULT 0 CHECK ("current_seat" >= 0),
        "dice"         SMALLINT[] NOT NULL DEFAULT '{}'
                        CHECK (cardinality("dice") IN (0, 5)
                            AND 1 <= ALL("dice") AND 6 >= ALL("dice")),
        "rolls_used"   SMALLINT NOT NULL DEFAULT 0 CHECK ("rolls_used" BETWEEN 0 AND 3),
      "created_at"  TIMESTAMPTZ NOT NULL DEFAULT now(),
      "finished_at" TIMESTAMPTZ
    );

    CREATE INDEX IF NOT EXISTS "games_owner_uuid_idx" ON "games" ("owner_uuid");

    CREATE TABLE IF NOT EXISTS "game_players" (
      "game_uuid"       UUID NOT NULL REFERENCES "games"("uuid") ON DELETE CASCADE,
      "player_uuid"     UUID NOT NULL REFERENCES "users"("uuid") ON DELETE CASCADE,
      "seat"            SMALLINT NOT NULL CHECK ("seat" >= 0),

      "ones"            SMALLINT CHECK ("ones"   BETWEEN 0 AND 5),
      "twos"            SMALLINT CHECK ("twos"   BETWEEN 0 AND 10),
      "threes"          SMALLINT CHECK ("threes" BETWEEN 0 AND 15),
      "fours"           SMALLINT CHECK ("fours"  BETWEEN 0 AND 20),
      "fives"           SMALLINT CHECK ("fives"  BETWEEN 0 AND 25),
      "sixes"           SMALLINT CHECK ("sixes"  BETWEEN 0 AND 30),

      "one_pair"        SMALLINT CHECK ("one_pair"        BETWEEN 0 AND 12),
      "two_pairs"       SMALLINT CHECK ("two_pairs"       BETWEEN 0 AND 22),
      "three_of_a_kind" SMALLINT CHECK ("three_of_a_kind" BETWEEN 0 AND 18),
      "four_of_a_kind"  SMALLINT CHECK ("four_of_a_kind"  BETWEEN 0 AND 24),
      "small_straight"  SMALLINT CHECK ("small_straight"  IN (0, 15)),
      "large_straight"  SMALLINT CHECK ("large_straight"  IN (0, 20)),
      "full_house"      SMALLINT CHECK ("full_house"      BETWEEN 0 AND 28),
      "chance"          SMALLINT CHECK ("chance"          BETWEEN 0 AND 30),
      "yatzy"           SMALLINT CHECK ("yatzy"           IN (0, 50)),

      "joined_at"       TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY ("game_uuid", "player_uuid"),
      UNIQUE ("game_uuid", "seat")
    );

    CREATE INDEX IF NOT EXISTS "game_players_player_uuid_idx"
      ON "game_players" ("player_uuid");
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS "game_players", "games", "refresh_tokens", "user_credentials", "users";
  `);
};

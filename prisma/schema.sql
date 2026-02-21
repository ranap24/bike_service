-- BikeService Database Schema
-- Run this on your Neon database to initialize all tables.

-- ── Enums ───────────────────────────────────────────────────────────────────

CREATE TYPE "UserRole"    AS ENUM ('RIDER', 'CAPTAIN', 'ADMIN');
CREATE TYPE "RideStatus"  AS ENUM ('REQUESTED', 'ACCEPTED', 'CAPTAIN_ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
CREATE TYPE "VehicleType" AS ENUM ('BIKE', 'AUTO', 'CAR');

-- ── Users ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id                TEXT         PRIMARY KEY DEFAULT gen_random_uuid()::text,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  name              TEXT         NOT NULL,
  email             TEXT         NOT NULL UNIQUE,
  phone             TEXT         UNIQUE,
  password          TEXT         NOT NULL,
  role              "UserRole"   NOT NULL DEFAULT 'RIDER',
  avatar            TEXT,
  is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
  is_email_verified BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users (role);

-- ── Captains ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS captains (
  id                TEXT         PRIMARY KEY DEFAULT gen_random_uuid()::text,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  name              TEXT         NOT NULL,
  email             TEXT         NOT NULL UNIQUE,
  phone             TEXT         NOT NULL UNIQUE,
  password          TEXT         NOT NULL,
  avatar            TEXT,
  is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
  is_online         BOOLEAN      NOT NULL DEFAULT FALSE,
  is_verified       BOOLEAN      NOT NULL DEFAULT FALSE,
  vehicle_type      "VehicleType" NOT NULL,
  vehicle_plate     TEXT         NOT NULL UNIQUE,
  vehicle_model     TEXT         NOT NULL,
  vehicle_color     TEXT         NOT NULL,
  current_latitude  DOUBLE PRECISION,
  current_longitude DOUBLE PRECISION,
  rating            DOUBLE PRECISION NOT NULL DEFAULT 0,
  total_rides       INT          NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_captains_email     ON captains (email);
CREATE INDEX IF NOT EXISTS idx_captains_is_online ON captains (is_online);
CREATE INDEX IF NOT EXISTS idx_captains_verified  ON captains (is_verified);

-- ── Rides ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rides (
  id               TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rider_id         TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  captain_id       TEXT        REFERENCES captains(id) ON DELETE SET NULL,
  pickup_address   TEXT        NOT NULL,
  pickup_latitude  DOUBLE PRECISION NOT NULL,
  pickup_longitude DOUBLE PRECISION NOT NULL,
  drop_address     TEXT        NOT NULL,
  drop_latitude    DOUBLE PRECISION NOT NULL,
  drop_longitude   DOUBLE PRECISION NOT NULL,
  status           "RideStatus" NOT NULL DEFAULT 'REQUESTED',
  fare             DOUBLE PRECISION NOT NULL,
  distance         DOUBLE PRECISION NOT NULL,
  duration         INT         NOT NULL,
  otp              TEXT,
  started_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_rides_rider_id   ON rides (rider_id);
CREATE INDEX IF NOT EXISTS idx_rides_captain_id ON rides (captain_id);
CREATE INDEX IF NOT EXISTS idx_rides_status     ON rides (status);

-- ── Payments ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payments (
  id                       TEXT           PRIMARY KEY DEFAULT gen_random_uuid()::text,
  created_at               TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  ride_id                  TEXT           NOT NULL UNIQUE REFERENCES rides(id) ON DELETE CASCADE,
  user_id                  TEXT           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount                   DOUBLE PRECISION NOT NULL,
  currency                 TEXT           NOT NULL DEFAULT 'INR',
  status                   "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  stripe_payment_intent_id TEXT,
  razorpay_order_id        TEXT,
  razorpay_payment_id      TEXT,
  paid_at                  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status  ON payments (status);

-- ── Ratings ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ratings (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ride_id         TEXT        NOT NULL UNIQUE REFERENCES rides(id) ON DELETE CASCADE,
  user_id         TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  captain_id      TEXT        NOT NULL REFERENCES captains(id) ON DELETE CASCADE,
  rider_rating    DOUBLE PRECISION,
  captain_rating  DOUBLE PRECISION,
  rider_comment   TEXT,
  captain_comment TEXT
);

CREATE INDEX IF NOT EXISTS idx_ratings_captain_id ON ratings (captain_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id    ON ratings (user_id);

-- ── Refresh Tokens ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  token      TEXT        NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  user_id    TEXT        REFERENCES users(id) ON DELETE CASCADE,
  captain_id TEXT        REFERENCES captains(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens (token);

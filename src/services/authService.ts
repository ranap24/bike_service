import bcrypt from "bcryptjs";
import { sql } from "../lib/db";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../lib/auth";
import {
  RegisterUserInput,
  RegisterCaptainInput,
  LoginInput,
  AuthTokens,
  UserRole,
} from "../types/index.types";

const SALT_ROUNDS = 12;

// ─── User Auth ─────────────────────────────────────────────

export async function registerUser(input: RegisterUserInput) {
  const existing = await sql`SELECT id FROM users WHERE email = ${input.email} LIMIT 1`;
  if (existing.length > 0) throw new Error("Email already in use");

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
  const id = crypto.randomUUID();
  const rows = await sql`
    INSERT INTO users (id, name, email, phone, password, role)
    VALUES (${id}, ${input.name}, ${input.email}, ${input.phone ?? null}, ${hashedPassword}, 'RIDER')
    RETURNING id, name, email, phone, role, created_at AS "createdAt"
  `;
  return rows[0];
}

export async function loginUser(input: LoginInput): Promise<{ tokens: AuthTokens; user: object }> {
  const rows = await sql`SELECT * FROM users WHERE email = ${input.email} LIMIT 1`;
  const user = rows[0];
  if (!user || !user.is_active) throw new Error("Invalid credentials");

  const isValid = await bcrypt.compare(input.password, user.password as string);
  if (!isValid) throw new Error("Invalid credentials");

  const payload = { id: user.id as string, email: user.email as string, role: user.role as UserRole };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await sql`
    INSERT INTO refresh_tokens (id, token, user_id, expires_at)
    VALUES (${crypto.randomUUID()}, ${refreshToken}, ${user.id}, ${expiresAt.toISOString()})
  `;

  const { password: _p, ...safeUser } = user;
  return { tokens: { accessToken, refreshToken }, user: safeUser };
}

// ─── Captain Auth ───────────────────────────────────────────

export async function registerCaptain(input: RegisterCaptainInput) {
  const existing = await sql`SELECT id FROM captains WHERE email = ${input.email} LIMIT 1`;
  if (existing.length > 0) throw new Error("Email already in use");

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
  const id = crypto.randomUUID();
  const rows = await sql`
    INSERT INTO captains (id, name, email, phone, password, vehicle_type, vehicle_plate, vehicle_model, vehicle_color)
    VALUES (
      ${id}, ${input.name}, ${input.email}, ${input.phone},
      ${hashedPassword}, ${input.vehicleType}, ${input.vehiclePlate},
      ${input.vehicleModel}, ${input.vehicleColor}
    )
    RETURNING
      id, name, email, phone,
      vehicle_type AS "vehicleType",
      vehicle_plate AS "vehiclePlate",
      is_verified AS "isVerified",
      created_at AS "createdAt"
  `;
  return rows[0];
}

export async function loginCaptain(input: LoginInput): Promise<{ tokens: AuthTokens; captain: object }> {
  const rows = await sql`SELECT * FROM captains WHERE email = ${input.email} LIMIT 1`;
  const captain = rows[0];
  if (!captain || !captain.is_active) throw new Error("Invalid credentials");

  const isValid = await bcrypt.compare(input.password, captain.password as string);
  if (!isValid) throw new Error("Invalid credentials");

  const payload = { id: captain.id as string, email: captain.email as string, role: "CAPTAIN" as UserRole };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await sql`
    INSERT INTO refresh_tokens (id, token, captain_id, expires_at)
    VALUES (${crypto.randomUUID()}, ${refreshToken}, ${captain.id}, ${expiresAt.toISOString()})
  `;

  const { password: _p, ...safeCaptain } = captain;
  return { tokens: { accessToken, refreshToken }, captain: safeCaptain };
}

// ─── Refresh Token ──────────────────────────────────────────

export async function refreshTokens(token: string): Promise<AuthTokens> {
  const payload = verifyRefreshToken(token);

  const stored = await sql`SELECT * FROM refresh_tokens WHERE token = ${token} LIMIT 1`;
  const record = stored[0];
  if (!record || new Date(record.expires_at as string) < new Date()) throw new Error("Invalid refresh token");

  await sql`DELETE FROM refresh_tokens WHERE token = ${token}`;

  const newAccess = signAccessToken({ id: payload.id, email: payload.email, role: payload.role });
  const newRefresh = signRefreshToken({ id: payload.id, email: payload.email, role: payload.role });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  if (payload.role === "CAPTAIN") {
    await sql`INSERT INTO refresh_tokens (id, token, captain_id, expires_at) VALUES (${crypto.randomUUID()}, ${newRefresh}, ${payload.id}, ${expiresAt.toISOString()})`;
  } else {
    await sql`INSERT INTO refresh_tokens (id, token, user_id, expires_at) VALUES (${crypto.randomUUID()}, ${newRefresh}, ${payload.id}, ${expiresAt.toISOString()})`;
  }

  return { accessToken: newAccess, refreshToken: newRefresh };
}

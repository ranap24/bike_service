import bcrypt from "bcryptjs";
import { prisma } from "../lib/db";
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
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new Error("Email already in use");

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: hashedPassword,
      role: "RIDER",
    },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  });
  return user;
}

export async function loginUser(input: LoginInput): Promise<{ tokens: AuthTokens; user: object }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.isActive) throw new Error("Invalid credentials");

  const isValid = await bcrypt.compare(input.password, user.password);
  if (!isValid) throw new Error("Invalid credentials");

  const payload = { id: user.id, email: user.email, role: user.role as UserRole };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  });

  const { password: _, ...safeUser } = user;
  return { tokens: { accessToken, refreshToken }, user: safeUser };
}

// ─── Captain Auth ───────────────────────────────────────────

export async function registerCaptain(input: RegisterCaptainInput) {
  const existing = await prisma.captain.findUnique({ where: { email: input.email } });
  if (existing) throw new Error("Email already in use");

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
  const captain = await prisma.captain.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: hashedPassword,
      vehicleType: input.vehicleType,
      vehiclePlate: input.vehiclePlate,
      vehicleModel: input.vehicleModel,
      vehicleColor: input.vehicleColor,
    },
    select: {
      id: true, name: true, email: true, phone: true,
      vehicleType: true, vehiclePlate: true, isVerified: true, createdAt: true,
    },
  });
  return captain;
}

export async function loginCaptain(input: LoginInput): Promise<{ tokens: AuthTokens; captain: object }> {
  const captain = await prisma.captain.findUnique({ where: { email: input.email } });
  if (!captain || !captain.isActive) throw new Error("Invalid credentials");

  const isValid = await bcrypt.compare(input.password, captain.password);
  if (!isValid) throw new Error("Invalid credentials");

  const payload = { id: captain.id, email: captain.email, role: "CAPTAIN" as UserRole };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: { token: refreshToken, captainId: captain.id, expiresAt },
  });

  const { password: _, ...safeCaptain } = captain;
  return { tokens: { accessToken, refreshToken }, captain: safeCaptain };
}

// ─── Refresh Token ──────────────────────────────────────────

export async function refreshTokens(token: string): Promise<AuthTokens> {
  const payload = verifyRefreshToken(token);

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) throw new Error("Invalid refresh token");

  await prisma.refreshToken.delete({ where: { token } });

  const newAccess = signAccessToken({ id: payload.id, email: payload.email, role: payload.role });
  const newRefresh = signRefreshToken({ id: payload.id, email: payload.email, role: payload.role });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const data = payload.role === "CAPTAIN"
    ? { token: newRefresh, captainId: payload.id, expiresAt }
    : { token: newRefresh, userId: payload.id, expiresAt };

  await prisma.refreshToken.create({ data });

  return { accessToken: newAccess, refreshToken: newRefresh };
}

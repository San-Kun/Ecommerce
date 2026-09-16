import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";

const accessSecretEnv = process.env.JWT_ACCESS_SECRET;
const refreshSecretEnv = process.env.JWT_REFRESH_SECRET;

if (!accessSecretEnv || !refreshSecretEnv) {
  throw new Error("Missing JWT secrets in environment variables.");
}

const ACCESS_SECRET = new TextEncoder().encode(accessSecretEnv);
const REFRESH_SECRET = new TextEncoder().encode(refreshSecretEnv);

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "30d";

export interface AccessTokenPayload {
  sub: string; // user id
  role: Role;
  name: string;
}

export interface RefreshTokenPayload {
  sub: string; // user id
  tokenVersion: number;
}

export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(payload: RefreshTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_TTL)
    .sign(REFRESH_SECRET);
}

/** Return null (bukan throw) jika token invalid/kadaluarsa */
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return payload as unknown as AccessTokenPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload as unknown as RefreshTokenPayload;
  } catch {
    return null;
  }
}

export const COOKIE_NAMES = {
  access: "access_token",
  refresh: "refresh_token",
} as const;

export const COOKIE_MAX_AGE = {
  access: 60 * 15, // 15 menit
  refresh: 60 * 60 * 24 * 30, // 30 hari
} as const;
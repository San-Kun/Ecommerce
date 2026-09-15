import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";

// jose dipakai (bukan jsonwebtoken) karena middleware.ts jalan di Edge Runtime,
// yang tidak mendukung Node.js crypto API yang dipakai jsonwebtoken.

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);

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

/** Return null (bukan throw) kalau token invalid/kadaluarsa, supaya caller cukup cek falsy. */
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
  access: 60 * 15, // 15 menit, dalam detik
  refresh: 60 * 60 * 24 * 30, // 30 hari
} as const;

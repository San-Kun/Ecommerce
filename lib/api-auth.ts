import { NextResponse } from "next/server";
import {
  requireAuth,
  requireAdmin,
  getCurrentUser,
  UnauthenticatedError,
  ForbiddenError,
} from "./auth";
import type { AccessTokenPayload } from "./jwt";

/**
 * Ubah error auth (UnauthenticatedError / ForbiddenError) menjadi NextResponse
 * yang konsisten. Error lain dilempar ulang agar ditangani sebagai 500.
 */
export function authErrorResponse(err: unknown): NextResponse {
  if (err instanceof UnauthenticatedError) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  }
  if (err instanceof ForbiddenError) {
    return NextResponse.json({ error: "Akses khusus admin" }, { status: 403 });
  }
  throw err;
}

/**
 * Helper: jalankan requireAuth, kembalikan { user } atau { response } berisi error.
 * Contoh: const auth = await tryAuth(); if (auth.response) return auth.response;
 */
export async function tryAuth(): Promise<
  { user: AccessTokenPayload; response?: undefined } | { user?: undefined; response: NextResponse }
> {
  try {
    const user = await requireAuth();
    return { user };
  } catch (err) {
    return { response: authErrorResponse(err) };
  }
}

export async function tryAdmin(): Promise<
  { user: AccessTokenPayload; response?: undefined } | { user?: undefined; response: NextResponse }
> {
  try {
    const user = await requireAdmin();
    return { user };
  } catch (err) {
    return { response: authErrorResponse(err) };
  }
}

export { getCurrentUser };

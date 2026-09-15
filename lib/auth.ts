import { cookies } from "next/headers";
import { verifyAccessToken, COOKIE_NAMES, type AccessTokenPayload } from "./jwt";

/** Pakai di Server Component / Route Handler. Return null kalau belum login atau token invalid. */
export async function getCurrentUser(): Promise<AccessTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAMES.access)?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}

export class UnauthenticatedError extends Error {}
export class ForbiddenError extends Error {}

/** Lempar error kalau belum login. Dipakai di awal Route Handler yang wajib login. */
export async function requireAuth(): Promise<AccessTokenPayload> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthenticatedError("Silakan login terlebih dahulu");
  return user;
}

/** Lempar error kalau bukan admin. Dipakai di Route Handler /api/admin/*. */
export async function requireAdmin(): Promise<AccessTokenPayload> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") throw new ForbiddenError("Akses khusus admin");
  return user;
}
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, COOKIE_NAMES } from "@/lib/jwt";

const ADMIN_PATHS = ["/admin"];
const AUTH_REQUIRED_PATHS = ["/checkout", "/profil"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(COOKIE_NAMES.access)?.value;
  const user = token ? await verifyAccessToken(token) : null;

  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  const isAuthRequiredPath = AUTH_REQUIRED_PATHS.some((p) => pathname.startsWith(p));

  if (isAdminPath && (!user || user.role !== "ADMIN")) {
    // Bukan admin (atau belum login) yang coba akses /admin -> tendang ke login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRequiredPath && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/checkout/:path*", "/profil/:path*"],
};
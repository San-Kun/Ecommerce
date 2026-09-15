import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signAccessToken, signRefreshToken, COOKIE_NAMES, COOKIE_MAX_AGE } from "@/lib/jwt";
import { loginSchema } from "@/lib/validators/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  // Pesan error disamakan (email tidak ditemukan vs password salah) supaya tidak bocor
  // informasi email mana saja yang terdaftar.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
  }

  const accessToken = await signAccessToken({ sub: user.id, role: user.role, name: user.name });
  const refreshToken = await signRefreshToken({ sub: user.id, tokenVersion: user.tokenVersion });

  const response = NextResponse.json({ id: user.id, name: user.name, role: user.role });

  response.cookies.set(COOKIE_NAMES.access, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE.access,
  });

  response.cookies.set(COOKIE_NAMES.refresh, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth", // hanya dikirim ke endpoint auth (refresh, logout), bukan semua request
    maxAge: COOKIE_MAX_AGE.refresh,
  });

  return response;
}

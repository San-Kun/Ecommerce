import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyRefreshToken, signAccessToken, COOKIE_NAMES, COOKIE_MAX_AGE } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAMES.refresh)?.value;
  if (!token) {
    return NextResponse.json({ error: "Sesi tidak ditemukan, silakan login ulang" }, { status: 401 });
  }

  const payload = await verifyRefreshToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Sesi kadaluarsa, silakan login ulang" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });

  // tokenVersion tidak cocok berarti user sudah logout di sesi ini (lihat endpoint logout)
  if (!user || user.tokenVersion !== payload.tokenVersion) {
    return NextResponse.json({ error: "Sesi sudah tidak berlaku, silakan login ulang" }, { status: 401 });
  }

  const accessToken = await signAccessToken({ sub: user.id, role: user.role, name: user.name });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAMES.access, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE.access,
  });

  return response;
}

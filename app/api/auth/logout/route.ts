import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { COOKIE_NAMES } from "@/lib/jwt";

export async function POST() {
  const user = await getCurrentUser();

  if (user) {
    // Naikkan tokenVersion supaya refresh token lama (yang mungkin masih tersimpan
    // di device lain atau dicuri) langsung tidak valid lagi.
    await prisma.user.update({
      where: { id: user.sub },
      data: { tokenVersion: { increment: 1 } },
    });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_NAMES.access);
  response.cookies.delete(COOKIE_NAMES.refresh);
  return response;
}

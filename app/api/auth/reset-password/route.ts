import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validators/password";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// POST /api/auth/reset-password - setel password baru dengan token yang valid
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const tokenHash = hashToken(parsed.data.token);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "Token tidak valid atau sudah kadaluarsa" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  // Setel password, tandai token terpakai, dan naikkan tokenVersion supaya semua
  // sesi lama (refresh token) otomatis tidak berlaku -- semua dalam satu transaksi.
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash, tokenVersion: { increment: 1 } },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true, message: "Password berhasil diubah, silakan login." });
}

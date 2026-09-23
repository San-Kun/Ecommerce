import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validators/password";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// POST /api/auth/forgot-password - minta token reset password
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  // Respon selalu sukses walau email tidak terdaftar -- supaya tidak membocorkan
  // email mana yang punya akun (mencegah user enumeration).
  const genericResponse: Record<string, unknown> = {
    ok: true,
    message: "Jika email terdaftar, tautan reset password telah dibuat.",
  };

  if (!user) {
    return NextResponse.json(genericResponse);
  }

  // Batalkan token lama yang belum dipakai supaya hanya ada satu token aktif.
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const resetUrl = `/reset-password?token=${rawToken}`;

  // Di produksi, tautan ini seharusnya dikirim lewat email, BUKAN dikembalikan
  // di respon. Karena belum ada layanan email, di non-produksi kita kembalikan
  // tautannya supaya alur bisa diuji.
  if (process.env.NODE_ENV !== "production") {
    genericResponse.devResetUrl = resetUrl;
  } else {
    // TODO: kirim resetUrl ke email user via layanan email.
    console.info(`[forgot-password] reset link untuk ${user.email}: ${resetUrl}`);
  }

  return NextResponse.json(genericResponse);
}

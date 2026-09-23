import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getCurrentUser, requireAuth, UnauthenticatedError } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validators/auth";

// GET /api/auth/me - data user yang sedang login (dari token)
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Belum login" }, { status: 401 });
  }

  // Ambil data lengkap dari DB (token hanya berisi id/role/name).
  const profile = await prisma.user.findUnique({
    where: { id: user.sub },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

// PUT /api/auth/me - update profil (nama, no. HP, ganti password)
export async function PUT(req: NextRequest) {
  let user;
  try {
    user = await requireAuth();
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }
    throw err;
  }

  const body = await req.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const record = await prisma.user.findUnique({ where: { id: user.sub } });
  if (!record) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  const data: { name?: string; phone?: string | null; passwordHash?: string } = {};

  if (parsed.data.name) data.name = parsed.data.name;
  if (parsed.data.phone !== undefined) data.phone = parsed.data.phone === "" ? null : parsed.data.phone;

  // Ganti password: wajib cocokkan password lama dulu.
  if (parsed.data.newPassword) {
    const valid = await bcrypt.compare(parsed.data.currentPassword ?? "", record.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: { currentPassword: ["Password lama salah"] } }, { status: 400 });
    }
    data.passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  }

  const updated = await prisma.user.update({
    where: { id: user.sub },
    data,
    select: { id: true, name: true, email: true, phone: true, role: true },
  });

  return NextResponse.json(updated);
}

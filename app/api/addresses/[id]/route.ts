import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, UnauthenticatedError } from "@/lib/auth";
import { createAddressSchema } from "@/lib/validators/address";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: RouteParams) {
  let user;
  try {
    user = await requireAuth();
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }
    throw err;
  }

  const { id } = await params;
  const address = await prisma.address.findFirst({ where: { id, userId: user.sub } });
  if (!address) {
    return NextResponse.json({ error: "Alamat tidak ditemukan" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = createAddressSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({ where: { userId: user.sub }, data: { isDefault: false } });
  }

  const updated = await prisma.address.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  let user;
  try {
    user = await requireAuth();
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }
    throw err;
  }

  const { id } = await params;
  const address = await prisma.address.findFirst({ where: { id, userId: user.sub } });
  if (!address) {
    return NextResponse.json({ error: "Alamat tidak ditemukan" }, { status: 404 });
  }

  // Relasi Order->Address pakai onDelete: Restrict di skema, jadi alamat yang
  // pernah dipakai di pesanan memang tidak bisa dihapus -- cek dulu di sini
  // supaya errornya ramah, bukan error database mentah.
  const usedInOrder = await prisma.order.findFirst({ where: { addressId: id } });
  if (usedInOrder) {
    return NextResponse.json({ error: "Alamat ini pernah dipakai di pesanan, tidak bisa dihapus" }, { status: 409 });
  }

  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

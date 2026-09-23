import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { tryAdmin } from "@/lib/api-auth";
import { updateVoucherSchema } from "@/lib/validators/voucher";

type RouteParams = { params: Promise<{ id: string }> };

// PUT /api/admin/vouchers/[id] - update voucher (admin)
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const auth = await tryAdmin();
  if (auth.response) return auth.response;

  const { id } = await params;
  const voucher = await prisma.voucher.findUnique({ where: { id } });
  if (!voucher) {
    return NextResponse.json({ error: "Voucher tidak ditemukan" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateVoucherSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const d = parsed.data;

  if (d.code && d.code !== voucher.code) {
    const clash = await prisma.voucher.findUnique({ where: { code: d.code } });
    if (clash) {
      return NextResponse.json({ error: "Kode voucher sudah dipakai" }, { status: 409 });
    }
  }

  const updated = await prisma.voucher.update({
    where: { id },
    data: {
      ...(d.code !== undefined ? { code: d.code } : {}),
      ...(d.description !== undefined ? { description: d.description } : {}),
      ...(d.type !== undefined ? { type: d.type } : {}),
      ...(d.value !== undefined ? { value: d.value } : {}),
      ...(d.minSpend !== undefined ? { minSpend: d.minSpend } : {}),
      ...(d.maxDiscount !== undefined ? { maxDiscount: d.maxDiscount ?? null } : {}),
      ...(d.isActive !== undefined ? { isActive: d.isActive } : {}),
      ...(d.expiresAt !== undefined ? { expiresAt: d.expiresAt ? new Date(d.expiresAt) : null } : {}),
      ...(d.usageLimit !== undefined ? { usageLimit: d.usageLimit ?? null } : {}),
    },
  });

  return NextResponse.json({ id: updated.id });
}

// DELETE /api/admin/vouchers/[id] - hapus voucher (admin)
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const auth = await tryAdmin();
  if (auth.response) return auth.response;

  const { id } = await params;
  const voucher = await prisma.voucher.findUnique({ where: { id } });
  if (!voucher) {
    return NextResponse.json({ error: "Voucher tidak ditemukan" }, { status: 404 });
  }

  await prisma.voucher.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

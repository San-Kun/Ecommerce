import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { tryAdmin } from "@/lib/api-auth";
import { createVoucherSchema } from "@/lib/validators/voucher";

// GET /api/admin/vouchers - daftar voucher (admin)
export async function GET() {
  const auth = await tryAdmin();
  if (auth.response) return auth.response;

  const vouchers = await prisma.voucher.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({
    items: vouchers.map((v) => ({
      id: v.id,
      code: v.code,
      description: v.description,
      type: v.type,
      value: Number(v.value),
      minSpend: Number(v.minSpend),
      maxDiscount: v.maxDiscount != null ? Number(v.maxDiscount) : null,
      isActive: v.isActive,
      expiresAt: v.expiresAt,
      usageLimit: v.usageLimit,
      usedCount: v.usedCount,
    })),
  });
}

// POST /api/admin/vouchers - buat voucher (admin)
export async function POST(req: NextRequest) {
  const auth = await tryAdmin();
  if (auth.response) return auth.response;

  const body = await req.json();
  const parsed = createVoucherSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const d = parsed.data;
  const existing = await prisma.voucher.findUnique({ where: { code: d.code } });
  if (existing) {
    return NextResponse.json({ error: "Kode voucher sudah dipakai" }, { status: 409 });
  }

  const voucher = await prisma.voucher.create({
    data: {
      code: d.code,
      description: d.description,
      type: d.type,
      value: d.value,
      minSpend: d.minSpend,
      maxDiscount: d.maxDiscount ?? null,
      isActive: d.isActive,
      expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
      usageLimit: d.usageLimit ?? null,
    },
  });

  return NextResponse.json({ id: voucher.id }, { status: 201 });
}

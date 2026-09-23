import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, ForbiddenError, UnauthenticatedError } from "@/lib/auth";
import { updateOrderStatusSchema } from "@/lib/validators/order";
import type { OrderStatus } from "@prisma/client";

type RouteParams = { params: Promise<{ Id: string }> };

// Admin cuma boleh MENDORONG MAJU status pengiriman -- bukan mengubah status
// pembayaran (itu wewenang webhook Midtrans) atau melompat status sembarangan.
const ALLOWED_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  DIPROSES: ["DIKIRIM"],
  DIKIRIM: ["SELESAI"],
};

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: "Akses khusus admin" }, { status: 403 });
    }
    throw err;
  }

  const { Id: id } = await params;
  const body = await req.json();
  const parsed = updateOrderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  const allowedNext = ALLOWED_TRANSITIONS[order.status] ?? [];
  if (!allowedNext.includes(parsed.data.status)) {
    return NextResponse.json(
      { error: `Tidak bisa mengubah status dari ${order.status} ke ${parsed.data.status}` },
      { status: 400 }
    );
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json(updated);
}

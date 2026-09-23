import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { tryAdmin } from "@/lib/api-auth";
import { markOrderPaid, markOrderFailed } from "@/lib/order-status";

type RouteParams = { params: Promise<{ Id: string }> };

const confirmPaymentSchema = z.object({
  outcome: z.enum(["paid", "failed"]),
});

// PUT /api/orders/[Id]/payment - admin konfirmasi pembayaran manual (Transfer/COD)
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const auth = await tryAdmin();
  if (auth.response) return auth.response;

  const { Id } = await params;
  const body = await req.json();
  const parsed = confirmPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: Id } });
  if (!order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  if (order.paymentStatus !== "MENUNGGU") {
    return NextResponse.json(
      { error: `Pembayaran pesanan ini sudah berstatus ${order.paymentStatus}` },
      { status: 409 }
    );
  }

  // markOrderPaid/markOrderFailed pakai orderNumber & idempotent.
  if (parsed.data.outcome === "paid") {
    await markOrderPaid(order.orderNumber, `MANUAL-${Date.now()}`);
  } else {
    await markOrderFailed(order.orderNumber);
  }

  const updated = await prisma.order.findUnique({
    where: { id: Id },
    select: { id: true, status: true, paymentStatus: true },
  });

  return NextResponse.json(updated);
}

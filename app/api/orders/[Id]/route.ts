import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { tryAuth } from "@/lib/api-auth";

type RouteParams = { params: Promise<{ Id: string }> };

// GET /api/orders/[Id] - detail satu pesanan (hanya pemilik atau admin)
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const auth = await tryAuth();
  if (auth.response) return auth.response;
  const user = auth.user;

  const { Id } = await params;

  const order = await prisma.order.findUnique({
    where: { id: Id },
    include: {
      address: true,
      items: { include: { product: { select: { name: true, slug: true, unit: true, images: true } } } },
    },
  });

  if (!order || (order.userId !== user.sub && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    shippingSchedule: order.shippingSchedule,
    subtotalAmount: Number(order.subtotalAmount),
    shippingCost: Number(order.shippingCost),
    totalAmount: Number(order.totalAmount),
    createdAt: order.createdAt,
    address: {
      label: order.address.label,
      fullAddress: order.address.fullAddress,
    },
    items: order.items.map((it) => ({
      id: it.id,
      productName: it.product.name,
      productSlug: it.product.slug,
      unit: it.product.unit,
      image: Array.isArray(it.product.images) ? ((it.product.images as string[])[0] ?? null) : null,
      quantity: Number(it.quantity),
      priceAtPurchase: Number(it.priceAtPurchase),
      subtotal: Number(it.subtotal),
    })),
  });
}

// PATCH /api/orders/[Id] - pembatalan pesanan oleh pemilik (jika memenuhi syarat)
export async function PATCH(_req: NextRequest, { params }: RouteParams) {
  const auth = await tryAuth();
  if (auth.response) return auth.response;
  const user = auth.user;

  const { Id } = await params;

  const order = await prisma.order.findUnique({
    where: { id: Id },
    include: { items: true },
  });

  if (!order || order.userId !== user.sub) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  // Syarat pembatalan: pesanan hanya boleh dibatalkan customer saat masih
  // PENDING atau DIPROSES. Setelah DIKIRIM/SELESAI tidak bisa dibatalkan.
  if (order.status !== "PENDING" && order.status !== "DIPROSES") {
    return NextResponse.json(
      { error: `Pesanan dengan status ${order.status} tidak dapat dibatalkan` },
      { status: 409 }
    );
  }

  // Jangan biarkan customer membatalkan pesanan yang pembayarannya sudah berhasil,
  // itu perlu proses refund oleh admin, bukan pembatalan biasa.
  if (order.paymentStatus === "BERHASIL") {
    return NextResponse.json(
      { error: "Pembayaran sudah berhasil, hubungi admin untuk proses refund" },
      { status: 409 }
    );
  }

  // Batalkan + kembalikan stok yang sempat dipotong saat order dibuat.
  const updated = await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      const wholeUnits = Math.ceil(Number(item.quantity));
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: wholeUnits }, soldCount: { decrement: wholeUnits } },
      });
    }
    return tx.order.update({
      where: { id: order.id },
      data: { status: "DIBATALKAN", paymentStatus: "GAGAL" },
    });
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}

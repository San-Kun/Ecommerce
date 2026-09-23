import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { tryAdmin } from "@/lib/api-auth";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/admin/customers/[id] - detail customer + statistik & riwayat (admin)
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const auth = await tryAdmin();
  if (auth.response) return auth.response;

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      addresses: { select: { id: true, label: true, fullAddress: true, isDefault: true } },
      orders: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          totalAmount: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user || user.role !== "USER") {
    return NextResponse.json({ error: "Customer tidak ditemukan" }, { status: 404 });
  }

  // Total belanja = jumlah pesanan yang pembayarannya BERHASIL.
  const totalSpent = user.orders
    .filter((o) => o.paymentStatus === "BERHASIL")
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    joinedAt: user.createdAt,
    stats: {
      orderCount: user.orders.length,
      totalSpent,
    },
    addresses: user.addresses,
    orders: user.orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      totalAmount: Number(o.totalAmount),
      createdAt: o.createdAt,
    })),
  });
}

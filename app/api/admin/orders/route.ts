import { NextRequest, NextResponse } from "next/server";
import type { Prisma, OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { tryAdmin } from "@/lib/api-auth";

const ORDER_STATUSES: OrderStatus[] = ["PENDING", "DIPROSES", "DIKIRIM", "SELESAI", "DIBATALKAN"];
const PAYMENT_STATUSES: PaymentStatus[] = ["MENUNGGU", "BERHASIL", "GAGAL"];

// GET /api/admin/orders - semua pesanan (admin) dengan pagination, search, filter status
export async function GET(req: NextRequest) {
  const auth = await tryAdmin();
  if (auth.response) return auth.response;

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));
  const search = searchParams.get("search")?.trim();
  const statusParam = searchParams.get("status") as OrderStatus | null;
  const paymentParam = searchParams.get("paymentStatus") as PaymentStatus | null;

  const where: Prisma.OrderWhereInput = {
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search } },
            { user: { name: { contains: search } } },
            { user: { email: { contains: search } } },
          ],
        }
      : {}),
    ...(statusParam && ORDER_STATUSES.includes(statusParam) ? { status: statusParam } : {}),
    ...(paymentParam && PAYMENT_STATUSES.includes(paymentParam) ? { paymentStatus: paymentParam } : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    items: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      totalAmount: Number(o.totalAmount),
      itemCount: o._count.items,
      customerName: o.user.name,
      customerEmail: o.user.email,
      createdAt: o.createdAt,
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}

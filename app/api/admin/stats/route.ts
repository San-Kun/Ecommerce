import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { tryAdmin } from "@/lib/api-auth";

// GET /api/admin/stats - ringkasan dashboard admin
export async function GET() {
  const auth = await tryAdmin();
  if (auth.response) return auth.response;

  const [
    salesAgg,
    totalOrders,
    totalCustomers,
    bestSellers,
    recentOrders,
    pendingOrders,
    lowStockCount,
  ] = await Promise.all([
    // Total penjualan hanya dihitung dari pesanan dengan pembayaran BERHASIL.
    prisma.order.aggregate({
      where: { paymentStatus: "BERHASIL" },
      _sum: { totalAmount: true },
    }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.product.findMany({
      orderBy: { soldCount: "desc" },
      take: 5,
      select: { id: true, name: true, slug: true, soldCount: true, price: true, stock: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { name: true } }, _count: { select: { items: true } } },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
    // Peringatan stok menipis untuk admin (stok <= 5 & produk masih aktif).
    prisma.product.count({ where: { status: "AKTIF", stock: { lte: 5 } } }),
  ]);

  return NextResponse.json({
    totalSales: Number(salesAgg._sum.totalAmount ?? 0),
    totalOrders,
    totalCustomers,
    pendingOrders,
    lowStockCount,
    bestSellers: bestSellers.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      soldCount: p.soldCount,
      price: Number(p.price),
      stock: p.stock,
    })),
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      totalAmount: Number(o.totalAmount),
      itemCount: o._count.items,
      customerName: o.user.name,
      createdAt: o.createdAt,
    })),
  });
}

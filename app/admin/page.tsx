import Link from "next/link";
import { prisma } from "@/lib/db";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

const statusLabel: Record<string, string> = {
  PENDING: "Menunggu pembayaran",
  DIPROSES: "Diproses",
  DIKIRIM: "Dikirim",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

export default async function AdminDashboardPage() {
  const [
    productCount,
    orderCount,
    customerCount,
    pendingCount,
    revenueAgg,
    bestSellers,
    recentOrders,
    lowStockProducts,
  ] = await Promise.all([
    prisma.product.count({ where: { status: "AKTIF" } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "BERHASIL" } }),
    prisma.product.findMany({
      where: { soldCount: { gt: 0 } },
      orderBy: { soldCount: "desc" },
      take: 5,
      select: { id: true, name: true, slug: true, soldCount: true, price: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true, user: { select: { name: true } } },
    }),
    prisma.product.findMany({
      where: { status: "AKTIF", stock: { lte: 5 } },
      orderBy: { stock: "asc" },
      take: 8,
      select: { id: true, name: true, slug: true, stock: true, unit: true },
    }),
  ]);

  const stats = [
    { label: "Total penjualan (lunas)", value: formatRupiah(Number(revenueAgg._sum.totalAmount ?? 0)) },
    { label: "Total pesanan", value: String(orderCount) },
    { label: "Total customer", value: String(customerCount) },
    { label: "Produk aktif", value: String(productCount) },
    { label: "Menunggu pembayaran", value: String(pendingCount) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-sm text-stone-500">Gambaran singkat toko kamu hari ini.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-sm text-stone-500">{s.label}</p>
            <p className="font-heading mt-1 text-xl font-bold text-stone-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Produk terlaris */}
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-heading font-semibold text-stone-900">Produk terlaris</h2>
          {bestSellers.length === 0 ? (
            <p className="mt-3 text-sm text-stone-400">Belum ada penjualan.</p>
          ) : (
            <div className="mt-3 divide-y divide-stone-100">
              {bestSellers.map((p, i) => (
                <div key={p.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="flex items-center gap-2 text-stone-700">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-xs font-medium text-emerald-700">
                      {i + 1}
                    </span>
                    <Link href={`/produk/${p.slug}`} className="hover:underline">
                      {p.name}
                    </Link>
                  </span>
                  <span className="text-stone-500">{p.soldCount} terjual</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Peringatan stok menipis */}
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-heading font-semibold text-stone-900">Stok menipis</h2>
          {lowStockProducts.length === 0 ? (
            <p className="mt-3 text-sm text-stone-400">Semua produk stoknya aman.</p>
          ) : (
            <div className="mt-3 divide-y divide-stone-100">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 text-sm">
                  <Link href={`/admin/produk/${p.slug}`} className="text-stone-700 hover:underline">
                    {p.name}
                  </Link>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.stock === 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    Sisa {p.stock} {p.unit.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pesanan terbaru */}
      <div className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="font-heading font-semibold text-stone-900">Pesanan terbaru</h2>
        {recentOrders.length === 0 ? (
          <p className="mt-3 text-sm text-stone-400">Belum ada pesanan.</p>
        ) : (
          <div className="mt-3 divide-y divide-stone-100">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <span className="text-stone-700">{o.orderNumber}</span>
                <span className="hidden text-stone-500 sm:inline">{o.user.name}</span>
                <span className="text-xs text-stone-400">{statusLabel[o.status] ?? o.status}</span>
                <span className="font-medium text-stone-900">{formatRupiah(Number(o.totalAmount))}</span>
              </div>
            ))}
          </div>
        )}
        <Link href="/admin/pesanan" className="mt-3 inline-block text-sm text-emerald-700 hover:underline">
          Lihat semua pesanan →
        </Link>
      </div>
    </div>
  );
}

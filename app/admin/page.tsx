import { prisma } from "@/lib/db";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

export default async function AdminDashboardPage() {
  const [productCount, orderCount, pendingCount, revenueAgg, recentOrders] = await Promise.all([
    prisma.product.count({ where: { status: "AKTIF" } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "BERHASIL" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { items: true } }),
  ]);

  const stats = [
    { label: "Produk aktif", value: String(productCount) },
    { label: "Total pesanan", value: String(orderCount) },
    { label: "Menunggu pembayaran", value: String(pendingCount) },
    { label: "Pendapatan (lunas)", value: formatRupiah(Number(revenueAgg._sum.totalAmount ?? 0)) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-stone-900">Ringkasan</h1>
        <p className="text-sm text-stone-500">Gambaran singkat toko kamu hari ini.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-sm text-stone-500">{s.label}</p>
            <p className="font-heading mt-1 text-2xl font-bold text-stone-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="font-heading font-semibold text-stone-900">Pesanan terbaru</h2>
        {recentOrders.length === 0 ? (
          <p className="mt-3 text-sm text-stone-400">Belum ada pesanan.</p>
        ) : (
          <div className="mt-3 divide-y divide-stone-100">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-stone-700">{o.orderNumber}</span>
                <span className="text-stone-500">{o.items.length} produk</span>
                <span className="font-medium text-stone-900">{formatRupiah(Number(o.totalAmount))}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

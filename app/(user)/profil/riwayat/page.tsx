import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const statusLabel: Record<string, string> = {
  PENDING: "Menunggu pembayaran",
  DIPROSES: "Diproses",
  DIKIRIM: "Dikirim",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

const statusStyle: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  DIPROSES: "bg-blue-50 text-blue-700",
  DIKIRIM: "bg-indigo-50 text-indigo-700",
  SELESAI: "bg-emerald-50 text-emerald-700",
  DIBATALKAN: "bg-stone-100 text-stone-500",
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

export default async function RiwayatPesananPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/profil/riwayat");

  const orders = await prisma.order.findMany({
    where: { userId: user.sub },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-xl font-semibold text-stone-900">Riwayat Pesanan</h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-center text-stone-400">Belum ada pesanan.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-stone-900">{order.orderNumber}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[order.status]}`}>
                  {statusLabel[order.status]}
                </span>
              </div>
              <p className="mt-1 text-sm text-stone-500">{order.items.length} produk</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-stone-500">
                  {new Date(order.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="font-medium text-stone-900">{formatRupiah(Number(order.totalAmount))}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

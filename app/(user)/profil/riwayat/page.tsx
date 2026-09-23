import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { LeafIcon } from "@/components/icons/LeafIcon";

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
      <h1 className="font-heading text-xl font-bold text-stone-900">Riwayat Pesanan</h1>

      {orders.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <LeafIcon className="h-12 w-12 text-emerald-200" />
          <p className="mt-4 text-stone-400">Belum ada pesanan.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-dashed border-stone-300 bg-white p-4">
              <div className="flex items-center justify-between">
                <a
                  href={`/profil/riwayat/${order.id}`}
                  className="font-heading font-semibold text-stone-900 hover:underline"
                >
                  {order.orderNumber}
                </a>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[order.status]}`}>
                  {statusLabel[order.status]}
                </span>
              </div>
              <p className="mt-1 text-sm text-stone-500">
                {order.items.length} produk
                {order.paymentMethod ? ` · ${order.paymentMethod === "COD" ? "Bayar di tempat" : "Transfer bank"}` : ""}
              </p>
              {order.paymentMethod === "TRANSFER" && order.paymentStatus === "MENUNGGU" && (
                <a
                  href={`/pembayaran/${order.orderNumber}`}
                  className="mt-1 inline-block text-xs font-medium text-emerald-700 hover:underline"
                >
                  Lihat instruksi pembayaran →
                </a>
              )}
              <div className="mt-2 flex items-center justify-between border-t border-dashed border-stone-200 pt-2">
                <span className="text-sm text-stone-500">
                  {new Date(order.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="font-heading font-semibold text-stone-900">
                  {formatRupiah(Number(order.totalAmount))}
                </span>
              </div>
              <a
                href={`/profil/riwayat/${order.id}`}
                className="mt-2 inline-block text-xs font-medium text-emerald-700 hover:underline"
              >
                Lihat detail pesanan →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

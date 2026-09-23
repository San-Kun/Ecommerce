import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SafeImage } from "@/components/common/SafeImage";
import { LeafIcon } from "@/components/icons/LeafIcon";
import { CancelOrderButton } from "@/components/order/CancelOrderButton";

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

const paymentLabel: Record<string, string> = {
  MENUNGGU: "Menunggu",
  BERHASIL: "Lunas",
  GAGAL: "Gagal / dibatalkan",
};

const unitLabel: Record<string, string> = { GRAM: "gram", KG: "kg", IKAT: "ikat", PCS: "pcs" };

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await getCurrentUser();
  if (!auth) redirect("/login?redirect=/profil/riwayat");

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      address: true,
      items: { include: { product: { select: { name: true, slug: true, unit: true, images: true } } } },
    },
  });

  // Hanya pemilik pesanan yang boleh melihat detailnya.
  if (!order || order.userId !== auth.sub) notFound();

  const canCancel =
    (order.status === "PENDING" || order.status === "DIPROSES") && order.paymentStatus !== "BERHASIL";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/profil/riwayat" className="text-sm text-emerald-700 hover:underline">
        ← Kembali ke riwayat
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-stone-900">{order.orderNumber}</h1>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[order.status]}`}>
          {statusLabel[order.status]}
        </span>
      </div>
      <p className="mt-1 text-sm text-stone-500">
        {new Date(order.createdAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>

      {/* Item */}
      <div className="mt-5 rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="font-heading font-semibold text-stone-900">Produk</h2>
        <div className="mt-3 divide-y divide-stone-100">
          {order.items.map((it) => {
            const image = Array.isArray(it.product.images) ? ((it.product.images as string[])[0] ?? null) : null;
            return (
              <div key={it.id} className="flex items-center gap-3 py-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-emerald-50">
                  {image ? (
                    <SafeImage src={image} alt={it.product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <LeafIcon className="h-6 w-6 text-emerald-300" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/produk/${it.product.slug}`} className="font-medium text-stone-900 hover:underline">
                    {it.product.name}
                  </Link>
                  <p className="text-xs text-stone-500">
                    {Number(it.quantity)} {unitLabel[it.product.unit] ?? it.product.unit.toLowerCase()} ×{" "}
                    {formatRupiah(Number(it.priceAtPurchase))}
                  </p>
                </div>
                <span className="text-sm font-medium text-stone-900">{formatRupiah(Number(it.subtotal))}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pengiriman + pembayaran */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <h2 className="font-heading font-semibold text-stone-900">Pengiriman</h2>
          <p className="mt-2 text-sm text-stone-700">{order.address.label}</p>
          <p className="text-sm text-stone-500">{order.address.fullAddress}</p>
          {order.shippingSchedule && (
            <p className="mt-2 text-xs text-stone-400">Jadwal: {order.shippingSchedule}</p>
          )}
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <h2 className="font-heading font-semibold text-stone-900">Pembayaran</h2>
          <p className="mt-2 text-sm text-stone-700">
            Metode: {order.paymentMethod === "COD" ? "Bayar di tempat (COD)" : order.paymentMethod === "TRANSFER" ? "Transfer bank" : "-"}
          </p>
          <p className="text-sm text-stone-500">Status: {paymentLabel[order.paymentStatus] ?? order.paymentStatus}</p>
          {order.paymentMethod === "TRANSFER" && order.paymentStatus === "MENUNGGU" && (
            <Link
              href={`/pembayaran/${order.orderNumber}`}
              className="mt-2 inline-block text-xs font-medium text-emerald-700 hover:underline"
            >
              Lihat instruksi pembayaran →
            </Link>
          )}
        </div>
      </div>

      {/* Ringkasan biaya */}
      <div className="mt-4 space-y-2 rounded-xl border border-dashed border-stone-300 bg-white p-4">
        <div className="flex justify-between text-sm">
          <span className="text-stone-500">Subtotal</span>
          <span className="text-stone-900">{formatRupiah(Number(order.subtotalAmount))}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-stone-500">Ongkos kirim</span>
          <span className="text-stone-900">{formatRupiah(Number(order.shippingCost))}</span>
        </div>
        <div className="flex items-center justify-between border-t border-dashed border-stone-300 pt-2 font-semibold text-stone-900">
          <span>Total</span>
          <span className="price-tag bg-emerald-700 py-1.5 pr-4 text-white">
            {formatRupiah(Number(order.totalAmount))}
          </span>
        </div>
      </div>

      {canCancel && (
        <div className="mt-6">
          <CancelOrderButton orderId={order.id} />
        </div>
      )}
    </div>
  );
}

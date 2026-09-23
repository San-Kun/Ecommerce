import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PrintButton } from "@/components/order/PrintButton";

const STORE = {
  name: process.env.STORE_BANK_HOLDER ?? "SayurKu Indonesia",
  tagline: "Sayur segar langsung dari petani",
};

const unitLabel: Record<string, string> = { GRAM: "gram", KG: "kg", IKAT: "ikat", PCS: "pcs" };
const paymentLabel: Record<string, string> = { MENUNGGU: "Menunggu", BERHASIL: "Lunas", GAGAL: "Gagal" };

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await getCurrentUser();
  if (!auth) redirect("/login?redirect=/profil/riwayat");

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      address: true,
      items: { include: { product: { select: { name: true, unit: true } } } },
    },
  });

  if (!order) notFound();
  if (order.userId !== auth.sub && auth.role !== "ADMIN") notFound();

  const discount = Number(order.discountAmount);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href={`/profil/riwayat/${order.id}`} className="text-sm text-emerald-700 hover:underline">
          ← Kembali ke detail
        </Link>
        <PrintButton />
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-8 print:border-0 print:p-0">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-200 pb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-emerald-800">{STORE.name}</h1>
            <p className="text-sm text-stone-500">{STORE.tagline}</p>
          </div>
          <div className="text-right">
            <p className="font-heading text-lg font-bold text-stone-900">INVOICE</p>
            <p className="text-sm text-stone-500">{order.orderNumber}</p>
          </div>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-4 py-6 text-sm">
          <div>
            <p className="font-medium text-stone-500">Ditagihkan kepada</p>
            <p className="mt-1 font-medium text-stone-900">{order.user.name}</p>
            <p className="text-stone-600">{order.user.email}</p>
            {order.user.phone && <p className="text-stone-600">{order.user.phone}</p>}
            <p className="mt-2 text-stone-600">{order.address.label} — {order.address.fullAddress}</p>
          </div>
          <div className="text-right">
            <p className="font-medium text-stone-500">Tanggal</p>
            <p className="mt-1 text-stone-900">
              {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p className="mt-2 font-medium text-stone-500">Pembayaran</p>
            <p className="text-stone-900">
              {order.paymentMethod === "COD" ? "Bayar di tempat (COD)" : order.paymentMethod === "TRANSFER" ? "Transfer bank" : (order.paymentMethod ?? "-")}
            </p>
            <p className="text-stone-600">{paymentLabel[order.paymentStatus] ?? order.paymentStatus}</p>
          </div>
        </div>

        {/* Items */}
        <table className="w-full text-left text-sm">
          <thead className="border-y border-stone-200 text-stone-500">
            <tr>
              <th className="py-2 font-medium">Produk</th>
              <th className="py-2 text-right font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Harga</th>
              <th className="py-2 text-right font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it) => (
              <tr key={it.id} className="border-b border-stone-100">
                <td className="py-2 text-stone-900">{it.product.name}</td>
                <td className="py-2 text-right text-stone-600">
                  {Number(it.quantity)} {unitLabel[it.product.unit] ?? it.product.unit.toLowerCase()}
                </td>
                <td className="py-2 text-right text-stone-600">{formatRupiah(Number(it.priceAtPurchase))}</td>
                <td className="py-2 text-right text-stone-900">{formatRupiah(Number(it.subtotal))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="ml-auto mt-4 w-full max-w-xs space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">Subtotal</span>
            <span className="text-stone-900">{formatRupiah(Number(order.subtotalAmount))}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <span className="text-stone-500">Diskon{order.voucherCode ? ` (${order.voucherCode})` : ""}</span>
              <span className="text-emerald-700">-{formatRupiah(discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-stone-500">Ongkos kirim</span>
            <span className="text-stone-900">{formatRupiah(Number(order.shippingCost))}</span>
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-2 font-semibold text-stone-900">
            <span>Total</span>
            <span>{formatRupiah(Number(order.totalAmount))}</span>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-stone-400">
          Terima kasih telah berbelanja di {STORE.name}. Invoice ini sah tanpa tanda tangan.
        </p>
      </div>
    </div>
  );
}

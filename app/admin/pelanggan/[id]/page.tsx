import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

const statusLabel: Record<string, string> = {
  PENDING: "Menunggu pembayaran",
  DIPROSES: "Diproses",
  DIKIRIM: "Dikirim",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  if (!user || user.role !== "USER") notFound();

  const totalSpent = user.orders
    .filter((o) => o.paymentStatus === "BERHASIL")
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  return (
    <div className="space-y-6">
      <Link href="/admin/pelanggan" className="text-sm text-emerald-700 hover:underline">
        ← Kembali ke daftar pelanggan
      </Link>

      <div>
        <h1 className="font-heading text-xl font-bold text-stone-900">{user.name}</h1>
        <p className="text-sm text-stone-500">{user.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-500">Total pesanan</p>
          <p className="font-heading mt-1 text-xl font-bold text-stone-900">{user.orders.length}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-500">Total belanja (lunas)</p>
          <p className="font-heading mt-1 text-xl font-bold text-stone-900">{formatRupiah(totalSpent)}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-500">No. HP</p>
          <p className="mt-1 font-medium text-stone-900">{user.phone ?? "-"}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-500">Bergabung</p>
          <p className="mt-1 font-medium text-stone-900">
            {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Alamat */}
      <div className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="font-heading font-semibold text-stone-900">Alamat</h2>
        {user.addresses.length === 0 ? (
          <p className="mt-2 text-sm text-stone-400">Belum ada alamat tersimpan.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {user.addresses.map((a) => (
              <div key={a.id} className="text-sm">
                <span className="font-medium text-stone-900">{a.label}</span>
                {a.isDefault && (
                  <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">Utama</span>
                )}
                <p className="text-stone-500">{a.fullAddress}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Riwayat pesanan */}
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">No. Pesanan</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Pembayaran</th>
              <th className="px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {user.orders.map((o) => (
              <tr key={o.id} className="border-b border-stone-100 last:border-0">
                <td className="px-4 py-3 font-medium text-stone-900">{o.orderNumber}</td>
                <td className="px-4 py-3 text-stone-500">
                  {new Date(o.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3 text-stone-600">{statusLabel[o.status] ?? o.status}</td>
                <td className="px-4 py-3 text-stone-600">{o.paymentStatus}</td>
                <td className="px-4 py-3 font-medium text-stone-900">{formatRupiah(Number(o.totalAmount))}</td>
              </tr>
            ))}
            {user.orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                  Belum ada pesanan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

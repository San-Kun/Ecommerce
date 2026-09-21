"use client";

import { useState, useTransition } from "react";

type OrderRow = {
  id: string;
  orderNumber: string;
  status: "PENDING" | "DIPROSES" | "DIKIRIM" | "SELESAI" | "DIBATALKAN";
  paymentStatus: "MENUNGGU" | "BERHASIL" | "GAGAL";
  totalAmount: number;
  itemCount: number;
  userName: string;
};

const statusLabel: Record<OrderRow["status"], string> = {
  PENDING: "Menunggu pembayaran",
  DIPROSES: "Diproses",
  DIKIRIM: "Dikirim",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

const statusStyle: Record<OrderRow["status"], string> = {
  PENDING: "bg-amber-50 text-amber-700",
  DIPROSES: "bg-blue-50 text-blue-700",
  DIKIRIM: "bg-indigo-50 text-indigo-700",
  SELESAI: "bg-emerald-50 text-emerald-700",
  DIBATALKAN: "bg-stone-100 text-stone-500",
};

const paymentStyle: Record<OrderRow["paymentStatus"], string> = {
  MENUNGGU: "bg-amber-50 text-amber-700",
  BERHASIL: "bg-emerald-50 text-emerald-700",
  GAGAL: "bg-red-50 text-red-700",
};

const NEXT_STATUS: Partial<Record<OrderRow["status"], { next: OrderRow["status"]; label: string }>> = {
  DIPROSES: { next: "DIKIRIM", label: "Tandai Dikirim" },
  DIKIRIM: { next: "SELESAI", label: "Tandai Selesai" },
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

export function AdminOrderTable({ initialOrders }: { initialOrders: OrderRow[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorId, setErrorId] = useState<string | null>(null);

  const filtered = statusFilter ? orders.filter((o) => o.status === statusFilter) : orders;

  function handleAdvance(orderId: string, nextStatus: OrderRow["status"]) {
    setErrorId(null);
    startTransition(async () => {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        setErrorId(orderId);
        return;
      }
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)));
    });
  }

  return (
    <div className="space-y-4">
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
      >
        <option value="">Semua status</option>
        {Object.entries(statusLabel).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">No. Pesanan</th>
              <th className="px-4 py-3 font-medium">Pelanggan</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Pembayaran</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const action = NEXT_STATUS[o.status];
              return (
                <tr key={o.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-stone-900">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-stone-600">{o.userName}</td>
                  <td className="px-4 py-3 text-stone-600">{formatRupiah(o.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${paymentStyle[o.paymentStatus]}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyle[o.status]}`}>
                      {statusLabel[o.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {action ? (
                      <button
                        onClick={() => handleAdvance(o.id, action.next)}
                        disabled={isPending}
                        className="text-sm text-emerald-700 hover:underline disabled:opacity-50"
                      >
                        {action.label}
                      </button>
                    ) : (
                      <span className="text-xs text-stone-400">—</span>
                    )}
                    {errorId === o.id && <p className="mt-1 text-xs text-red-600">Gagal memproses.</p>}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                  Tidak ada pesanan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

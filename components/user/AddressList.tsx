"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

type AddressRow = { id: string; label: string; fullAddress: string; isDefault: boolean };

export function AddressList({ initialAddresses }: { initialAddresses: AddressRow[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [isPending, startTransition] = useTransition();
  const [errorId, setErrorId] = useState<string | null>(null);

  function handleSetDefault(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
      }
    });
  }

  function handleDelete(id: string) {
    setErrorId(null);
    startTransition(async () => {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setErrorId(id);
        return;
      }
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    });
  }

  if (addresses.length === 0) {
    return <p className="mt-6 text-center text-stone-400">Belum ada alamat tersimpan.</p>;
  }

  return (
    <div className="mt-4 space-y-3">
      {addresses.map((a) => (
        <div key={a.id} className="rounded-xl border border-stone-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-stone-900">{a.label}</span>
            {a.isDefault && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Utama
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-stone-500">{a.fullAddress}</p>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <Link href={`/profil/alamat/${a.id}`} className="text-emerald-700 hover:underline">
              Edit
            </Link>
            {!a.isDefault && (
              <button
                type="button"
                onClick={() => handleSetDefault(a.id)}
                disabled={isPending}
                className="text-stone-500 hover:underline disabled:opacity-50"
              >
                Jadikan utama
              </button>
            )}
            <button
              type="button"
              onClick={() => handleDelete(a.id)}
              disabled={isPending}
              className="text-red-600 hover:underline disabled:opacity-50"
            >
              Hapus
            </button>
          </div>
          {errorId === a.id && (
            <p className="mt-1 text-xs text-red-600">Gagal menghapus (mungkin sudah dipakai di pesanan).</p>
          )}
        </div>
      ))}
    </div>
  );
}

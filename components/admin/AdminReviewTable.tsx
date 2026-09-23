"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  userName: string;
  productName: string;
  productSlug: string;
  createdAt: string;
};

export function AdminReviewTable({ initialReviews }: { initialReviews: ReviewRow[] }) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === "string" ? data.error : "Gagal menghapus review");
        return;
      }
      setReviews((prev) => prev.filter((r) => r.id !== id));
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Produk</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Komentar</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="border-b border-stone-100 last:border-0 align-top">
                <td className="px-4 py-3 font-medium text-stone-900">{r.productName}</td>
                <td className="px-4 py-3 text-stone-600">{r.userName}</td>
                <td className="px-4 py-3 text-amber-500">{"★".repeat(r.rating)}</td>
                <td className="px-4 py-3 max-w-xs text-stone-600">{r.comment ?? <span className="text-stone-400">—</span>}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={isPending}
                    className="text-red-600 hover:underline disabled:opacity-50"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                  Belum ada review.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

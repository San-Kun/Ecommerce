"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    const res = await fetch(`/api/products/${slug}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment: comment || undefined }),
    });

    if (res.status === 401) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = typeof data.error === "string" ? data.error : "Gagal mengirim ulasan";
      setError(msg);
      setIsSubmitting(false);
      return;
    }

    setSuccess(true);
    setComment("");
    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-stone-200 bg-white p-4">
      <p className="font-heading font-semibold text-stone-900">Tulis ulasan</p>
      <p className="text-xs text-stone-400">Kamu bisa memberi ulasan untuk produk yang pesanannya sudah selesai.</p>

      {success && (
        <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Terima kasih atas ulasanmu!</p>
      )}
      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            aria-label={`Beri ${star} bintang`}
            className="text-2xl leading-none"
          >
            <span className={(hover || rating) >= star ? "text-amber-500" : "text-stone-300"}>★</span>
          </button>
        ))}
        <span className="ml-2 text-sm text-stone-500">{rating} dari 5</span>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Bagikan pengalamanmu dengan produk ini (opsional)"
        className="mt-3 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-3 rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {isSubmitting ? "Mengirim..." : "Kirim ulasan"}
      </button>
    </form>
  );
}

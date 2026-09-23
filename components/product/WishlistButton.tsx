"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWishlistStore } from "@/store/useWishlistStore";
import { toast } from "@/store/useToastStore";

export function WishlistButton({ productId }: { productId: string }) {
  const router = useRouter();
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(productId));
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const items = useWishlistStore((s) => s.items);
  const [beat, setBeat] = useState(0);

  // Muat status wishlist sekali saja per mount (kalau belum pernah di-fetch di halaman ini)
  useEffect(() => {
    if (items.length === 0) fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleClick() {
    const res = await fetch("/api/wishlist", { method: "GET" });
    if (res.status === 401) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    const wasWishlisted = isWishlisted;
    await toggleWishlist(productId);

    if (wasWishlisted) {
      toast.info("Dihapus dari wishlist");
    } else {
      setBeat((b) => b + 1);
      toast.success("Ditambahkan ke wishlist");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isWishlisted ? "Hapus dari wishlist" : "Tambah ke wishlist"}
      aria-pressed={isWishlisted}
      className={`rounded-full border p-2 transition-colors ${
        isWishlisted
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-stone-300 bg-white/80 text-stone-400 backdrop-blur-sm hover:text-red-500"
      }`}
    >
      <svg
        key={beat}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isWishlisted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.8}
        className={`h-5 w-5 ${beat > 0 ? "animate-heart" : ""}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}

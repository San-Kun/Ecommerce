"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { LeafIcon } from "@/components/icons/LeafIcon";
import { CartIcon, SearchIcon, UserIcon, HeartIcon } from "@/components/icons/nav";

type NavbarProps = {
  isLoggedIn: boolean;
  userName?: string | null;
};

export function Navbar({ isLoggedIn, userName }: NavbarProps) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const count = items.length;

  useEffect(() => {
    if (isLoggedIn) fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = new FormData(e.currentTarget).get("search")?.toString().trim();
    router.push(value ? `/produk?search=${encodeURIComponent(value)}` : "/produk");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-white">
            <LeafIcon className="h-5 w-5" />
          </span>
          <span className="font-heading text-lg font-bold text-emerald-800">SayurKu</span>
        </Link>

        {/* Search (desktop) */}
        <form onSubmit={handleSearch} className="hidden flex-1 sm:block">
          <div className="mx-auto flex max-w-md items-center overflow-hidden rounded-full border border-stone-200 bg-stone-50 focus-within:border-emerald-500 focus-within:bg-white">
            <SearchIcon className="ml-3 h-4 w-4 text-stone-400" />
            <input
              type="text"
              name="search"
              placeholder="Cari bayam, tomat, cabai..."
              className="w-full bg-transparent px-3 py-2 text-sm text-stone-900 outline-none placeholder:text-stone-400"
            />
            <button type="submit" className="bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">
              Cari
            </button>
          </div>
        </form>

        {/* Actions */}
        <nav className="ml-auto flex items-center gap-1 sm:ml-0">
          <Link
            href="/profil/wishlist"
            aria-label="Wishlist"
            className="hidden rounded-full p-2 text-stone-600 hover:bg-emerald-50 hover:text-emerald-700 sm:inline-flex"
          >
            <HeartIcon className="h-5 w-5" />
          </Link>

          <Link
            href="/cart"
            aria-label="Keranjang"
            className="relative rounded-full p-2 text-stone-600 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <CartIcon className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>

          {isLoggedIn ? (
            <Link
              href="/profil"
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm text-stone-700 hover:bg-emerald-50"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <UserIcon className="h-4 w-4" />
              </span>
              <span className="hidden max-w-24 truncate font-medium sm:inline">{userName ?? "Profil"}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            >
              Masuk
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

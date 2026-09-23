"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { HomeIcon, GridIcon, CartIcon, UserIcon } from "@/components/icons/nav";

const items = [
  { href: "/", label: "Beranda", Icon: HomeIcon, exact: true },
  { href: "/kategori", label: "Kategori", Icon: GridIcon },
  { href: "/cart", label: "Keranjang", Icon: CartIcon, badge: true },
  { href: "/profil", label: "Profil", Icon: UserIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const count = useCartStore((s) => s.items.length);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur-md sm:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {items.map(({ href, label, Icon, exact, badge }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] ${
                active ? "text-emerald-700" : "text-stone-500"
              }`}
            >
              <span className="relative">
                <Icon className="h-6 w-6" />
                {badge && count > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-bold text-white">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </span>
              <span className={active ? "font-medium" : ""}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

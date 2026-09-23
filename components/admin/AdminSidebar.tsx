"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LeafIcon } from "@/components/icons/LeafIcon";

const navItems = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/produk", label: "Produk" },
  { href: "/admin/kategori", label: "Kategori" },
  { href: "/admin/pesanan", label: "Pesanan" },
  { href: "/admin/pelanggan", label: "Pelanggan" },
  { href: "/admin/review", label: "Review" },
];

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="border-b border-stone-200 bg-white lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-2 border-b border-stone-100 px-5 py-4">
        <LeafIcon className="h-5 w-5 text-emerald-600" />
        <span className="font-heading font-bold text-stone-900">SayurKu Admin</span>
      </div>

      <div className="px-5 py-4">
        <p className="text-xs text-stone-400">Masuk sebagai</p>
        <p className="font-medium text-stone-900">{userName}</p>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-5">
        {navItems.map((item) => {
          const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-sm ${
                isActive ? "bg-emerald-50 font-medium text-emerald-800" : "text-stone-700 hover:bg-stone-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

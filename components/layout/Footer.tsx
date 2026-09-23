import Link from "next/link";
import { LeafIcon } from "@/components/icons/LeafIcon";

const linkGroups = [
  {
    title: "Belanja",
    links: [
      { href: "/produk", label: "Semua Produk" },
      { href: "/kategori", label: "Kategori" },
      { href: "/paket-menu", label: "Paket Menu" },
    ],
  },
  {
    title: "Akun",
    links: [
      { href: "/profil", label: "Profil Saya" },
      { href: "/profil/riwayat", label: "Riwayat Pesanan" },
      { href: "/profil/wishlist", label: "Wishlist" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-12 border-t border-stone-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-white">
              <LeafIcon className="h-5 w-5" />
            </span>
            <span className="font-heading text-lg font-bold text-emerald-800">SayurKu</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm text-stone-500">
            Sayur segar langsung dari petani, dipetik pagi ini, diantar sebelum kamu mulai masak.
          </p>
        </div>

        {linkGroups.map((group) => (
          <div key={group.title}>
            <p className="font-heading text-sm font-semibold text-stone-900">{group.title}</p>
            <ul className="mt-3 space-y-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-stone-500 hover:text-emerald-700">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-stone-100 py-4">
        <p className="text-center text-xs text-stone-400">
          © {new Date().getFullYear()} SayurKu. Sayur segar untuk dapur kamu.
        </p>
      </div>
    </footer>
  );
}

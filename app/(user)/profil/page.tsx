import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "@/components/user/ProfileForm";
import { LogoutButton } from "@/components/user/LogoutButton";

const menuItems = [
  { href: "/profil/riwayat", label: "Riwayat Pesanan", desc: "Lihat transaksi kamu" },
  { href: "/profil/alamat", label: "Alamat Tersimpan", desc: "Kelola alamat pengiriman" },
  { href: "/profil/wishlist", label: "Wishlist", desc: "Produk favorit kamu" },
];

export default async function ProfilPage() {
  const auth = await getCurrentUser();
  if (!auth) redirect("/login?redirect=/profil");

  const user = await prisma.user.findUnique({
    where: { id: auth.sub },
    select: { name: true, email: true, phone: true, createdAt: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-heading text-xl font-bold text-stone-900">Profil Saya</h1>

      <div className="mt-4 rounded-xl border border-stone-200 bg-white p-5">
        <p className="text-sm text-stone-500">Email</p>
        <p className="font-medium text-stone-900">{user.email}</p>
        <p className="mt-1 text-xs text-stone-400">
          Bergabung sejak{" "}
          {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-stone-200 bg-white p-4 transition hover:border-emerald-400 hover:shadow-sm"
          >
            <p className="font-medium text-stone-900">{item.label}</p>
            <p className="text-xs text-stone-500">{item.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="font-heading font-semibold text-stone-900">Edit Data Diri</h2>
        <div className="mt-4">
          <ProfileForm initialName={user.name} initialPhone={user.phone ?? ""} />
        </div>
      </div>

      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
  );
}

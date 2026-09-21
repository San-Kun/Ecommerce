import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { AddressList } from "@/components/user/AddressList";

export default async function AlamatPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/profil/alamat");

  const addresses = await prisma.address.findMany({
    where: { userId: user.sub },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-stone-900">Alamat Tersimpan</h1>
        <Link
          href="/profil/alamat/baru"
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Tambah alamat
        </Link>
      </div>

      <AddressList
        initialAddresses={addresses.map((a) => ({
          id: a.id,
          label: a.label,
          fullAddress: a.fullAddress,
          isDefault: a.isDefault,
        }))}
      />
    </div>
  );
}

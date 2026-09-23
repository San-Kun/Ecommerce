import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminPelangganPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;

  const customers = await prisma.user.findMany({
    where: {
      role: "USER",
      ...(search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-stone-900">Pelanggan</h1>
        <p className="text-sm text-stone-500">{customers.length} customer terdaftar</p>
      </div>

      <form action="/admin/pelanggan" className="max-w-sm">
        <div className="flex overflow-hidden rounded-md border border-stone-300 bg-white">
          <input
            type="text"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Cari nama atau email..."
            className="w-full px-3 py-2 text-sm outline-none placeholder:text-stone-400"
          />
          <button type="submit" className="bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800">
            Cari
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">No. HP</th>
              <th className="px-4 py-3 font-medium">Pesanan</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-stone-100 last:border-0">
                <td className="px-4 py-3 font-medium text-stone-900">{c.name}</td>
                <td className="px-4 py-3 text-stone-600">{c.email}</td>
                <td className="px-4 py-3 text-stone-600">{c.phone ?? "-"}</td>
                <td className="px-4 py-3 text-stone-600">{c._count.orders}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/pelanggan/${c.id}`} className="text-emerald-700 hover:underline">
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                  Tidak ada customer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

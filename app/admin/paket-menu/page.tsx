import Link from "next/link";
import { prisma } from "@/lib/db";
import { PaketMenuTable } from "@/components/admin/PaketMenuTable";

export default async function AdminPaketMenuPage() {
  const pakets = await prisma.paketMenu.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-stone-900">Paket Menu</h1>
          <p className="text-sm text-stone-500">{pakets.length} paket terdaftar</p>
        </div>
        <Link
          href="/admin/paket-menu/baru"
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Tambah paket
        </Link>
      </div>

      <PaketMenuTable
        initialPakets={pakets.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: Number(p.price),
          itemCount: p._count.items,
        }))}
      />
    </div>
  );
}

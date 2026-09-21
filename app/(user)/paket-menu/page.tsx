import { prisma } from "@/lib/db";
import { PaketMenuCard } from "@/components/paket-menu/PaketMenuCard";
import { LeafIcon } from "@/components/icons/LeafIcon";

export default async function PaketMenuListPage() {
  const paketMenu = await prisma.paketMenu.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-heading text-xl font-bold text-stone-900">Paket Menu Masakan</h1>
      <p className="mt-1 text-sm text-stone-500">
        Bahan lengkap sesuai resep, tinggal tambah semua ke keranjang sekali klik.
      </p>

      {paketMenu.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <LeafIcon className="h-12 w-12 text-emerald-200" />
          <p className="mt-4 text-stone-400">Belum ada paket menu tersedia.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paketMenu.map((p) => (
            <PaketMenuCard
              key={p.id}
              paketMenu={{
                id: p.id,
                name: p.name,
                slug: p.slug,
                description: p.description,
                price: Number(p.price),
                image: p.image,
                itemCount: p.items.length,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

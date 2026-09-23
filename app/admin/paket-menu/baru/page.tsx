import { prisma } from "@/lib/db";
import { PaketMenuForm } from "@/components/admin/PaketMenuForm";

export default async function NewPaketMenuPage() {
  const products = await prisma.product.findMany({
    where: { status: "AKTIF" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, unit: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-stone-900">Tambah Paket Menu</h1>
        <p className="text-sm text-stone-500">Gabungkan beberapa produk menjadi satu paket masakan.</p>
      </div>
      <PaketMenuForm mode="create" products={products.map((p) => ({ id: p.id, name: p.name, unit: p.unit }))} />
    </div>
  );
}

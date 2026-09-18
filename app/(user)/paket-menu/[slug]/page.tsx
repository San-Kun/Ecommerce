import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PaketMenuAddToCartButton } from "@/components/paket-menu/PaketMenuAddToCartButton";

const unitLabel: Record<string, string> = {
  GRAM: "gram",
  KG: "kg",
  IKAT: "ikat",
  PCS: "pcs",
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

export default async function PaketMenuDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const paketMenu = await prisma.paketMenu.findUnique({
    where: { slug },
    include: { items: { include: { product: true } } },
  });

  if (!paketMenu) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="aspect-video overflow-hidden rounded-lg bg-stone-100">
        {paketMenu.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={paketMenu.image} alt={paketMenu.name} className="h-full w-full object-cover" />
        )}
      </div>

      <div className="mt-6">
        <h1 className="text-2xl font-semibold text-stone-900">{paketMenu.name}</h1>
        {paketMenu.description && <p className="mt-2 text-stone-600">{paketMenu.description}</p>}
        <p className="mt-3 text-xl font-semibold text-emerald-700">{formatRupiah(Number(paketMenu.price))}</p>
      </div>

      <div className="mt-8 rounded-lg border border-stone-200 bg-white p-5">
        <h2 className="font-medium text-stone-900">Bahan yang termasuk dalam paket ini</h2>
        <ul className="mt-3 divide-y divide-stone-100">
          {paketMenu.items.map((item) => {
            const isAvailable = item.product.status === "AKTIF" && item.product.stock > 0;
            return (
              <li key={item.productId} className="flex items-center justify-between py-2 text-sm">
                <span className="text-stone-700">{item.product.name}</span>
                <span className="flex items-center gap-2 text-stone-500">
                  {item.quantity} {unitLabel[item.product.unit] ?? item.product.unit.toLowerCase()}
                  {!isAvailable && <span className="text-xs text-red-600">(tidak tersedia)</span>}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-6">
        <PaketMenuAddToCartButton slug={paketMenu.slug} />
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PaketMenuAddToCartButton } from "@/components/paket-menu/PaketMenuAddToCartButton";
import { LeafIcon } from "@/components/icons/LeafIcon";
import { SafeImage } from "@/components/common/SafeImage"; // <-- Import SafeImage

const unitLabel: Record<string, string> = {
  GRAM: "gram",
  KG: "kg",
  IKAT: "ikat",
  PCS: "pcs",
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function PaketMenuDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const paketMenu = await prisma.paketMenu.findUnique({
    where: { slug },
    include: { items: { include: { product: true } } },
  });

  if (!paketMenu) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="leaf-pattern flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-emerald-50">
        {paketMenu.image ? (
          <SafeImage
            src={paketMenu.image}
            alt={paketMenu.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <LeafIcon className="h-16 w-16 text-emerald-300" />
        )}
      </div>

      <div className="mt-6">
        <h1 className="font-heading text-2xl font-bold text-stone-900">
          {paketMenu.name}
        </h1>
        {paketMenu.description && (
          <p className="mt-2 text-stone-600">{paketMenu.description}</p>
        )}
        <span className="price-tag mt-3 inline-block bg-emerald-700 py-1.5 pr-4 text-lg font-bold text-white">
          {formatRupiah(Number(paketMenu.price))}
        </span>
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-stone-300 bg-white p-5">
        <h2 className="font-heading font-semibold text-stone-900">
          Bahan yang termasuk dalam paket ini
        </h2>
        <ul className="mt-3 divide-y divide-dashed divide-stone-200">
          {paketMenu.items.map((item) => {
            const isAvailable =
              item.product.status === "AKTIF" && Number(item.product.stock) > 0;
            return (
              <li
                key={item.productId}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="text-stone-700">{item.product.name}</span>
                <span className="flex items-center gap-2 text-stone-500">
                  {item.quantity}{" "}
                  {unitLabel[item.product.unit] ??
                    item.product.unit.toLowerCase()}
                  {!isAvailable && (
                    <span className="text-xs text-red-600">
                      (tidak tersedia)
                    </span>
                  )}
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
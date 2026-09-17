import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { WishlistButton } from "@/components/product/WishlistButton";

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

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // Produk NONAKTIF (soft-deleted) diperlakukan sama seperti tidak ditemukan di sisi customer
  if (!product || product.status === "NONAKTIF") notFound();

  const images = Array.isArray(product.images) ? (product.images as string[]) : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-stone-100">
          {images[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={images[0]} alt={product.name} className="h-full w-full object-cover" />
          )}
          <div className="absolute right-3 top-3">
            <WishlistButton productId={product.id} />
          </div>
        </div>

        <div>
          <p className="text-sm text-stone-500">{product.category.name}</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-900">{product.name}</h1>

          <div className="mt-2 flex items-center gap-2">
            {product.isOrganic && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Organik
              </span>
            )}
            {product.reviewCount > 0 && (
              <span className="text-sm text-stone-500">
                ⭐ {Number(product.ratingAvg).toFixed(1)} ({product.reviewCount} ulasan)
              </span>
            )}
          </div>

          <p className="mt-4 text-2xl font-semibold text-stone-900">
            {formatRupiah(Number(product.price))}
            <span className="ml-1 text-sm font-normal text-stone-400">
              / {unitLabel[product.unit] ?? product.unit.toLowerCase()}
            </span>
          </p>

          {product.weightPerUnit && <p className="mt-1 text-sm text-stone-500">{product.weightPerUnit}</p>}

          {product.description && (
            <p className="mt-4 text-sm leading-relaxed text-stone-600">{product.description}</p>
          )}

          {product.origin && <p className="mt-3 text-sm text-stone-500">Asal: {product.origin}</p>}

          {product.stock > 0 && product.stock <= 5 && (
            <p className="mt-2 text-sm text-amber-600">Tersisa {product.stock} {unitLabel[product.unit]}</p>
          )}

          <div className="mt-6">
            <AddToCartButton
              product={{
                id: product.id,
                stepQuantity: Number(product.stepQuantity),
                minOrderQty: Number(product.minOrderQty),
                stock: product.stock,
                unit: product.unit,
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-stone-200 pt-8">
        <h2 className="text-lg font-semibold text-stone-900">Ulasan pembeli</h2>

        {product.reviews.length === 0 ? (
          <p className="mt-3 text-sm text-stone-400">Belum ada ulasan untuk produk ini.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="border-b border-stone-100 pb-4 last:border-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-stone-900">{review.user.name}</span>
                  <span className="text-sm text-amber-600">{"⭐".repeat(review.rating)}</span>
                </div>
                {review.comment && <p className="mt-1 text-sm text-stone-600">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

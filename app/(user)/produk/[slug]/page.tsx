import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";

import { AddToCartButton } from "@/components/product/AddToCartButton";
import { WishlistButton } from "@/components/product/WishlistButton";
import { ReviewForm } from "@/components/product/ReviewForm";
import { ProductGallery } from "@/components/product/ProductGallery";
import { LeafIcon } from "@/components/icons/LeafIcon";
import { getCurrentUser } from "@/lib/auth";

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

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!product || product.status === "NONAKTIF") {
    notFound();
  }

  const currentUser = await getCurrentUser();

  const images = Array.isArray(product.images)
    ? (product.images as string[])
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Product Gallery */}
        <ProductGallery
          images={images}
          alt={product.name}
          isOrganic={product.isOrganic}
          overlay={<WishlistButton productId={product.id} />}
        />

        {/* Product Information */}
        <div>
          <p className="text-sm text-stone-500">
            {product.category.name}
          </p>

          <h1 className="font-heading mt-1 text-2xl font-bold text-stone-900">
            {product.name}
          </h1>

          {product.reviewCount > 0 && (
            <p className="mt-2 text-sm text-stone-500">
              ⭐ {Number(product.ratingAvg).toFixed(1)} (
              {product.reviewCount} ulasan)
            </p>
          )}

          <div className="mt-4 flex items-center gap-2">
            <span className="price-tag bg-emerald-700 py-1.5 pr-4 text-lg font-bold text-white">
              {formatRupiah(Number(product.price))}
            </span>

            <span className="text-sm text-stone-400">
              / {unitLabel[product.unit] ?? product.unit.toLowerCase()}
            </span>
          </div>

          {product.weightPerUnit && (
            <p className="mt-2 text-sm text-stone-500">
              {product.weightPerUnit}
            </p>
          )}

          {product.description && (
            <p className="mt-4 text-sm leading-relaxed text-stone-600">
              {product.description}
            </p>
          )}

          {product.origin && (
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-800">
              <LeafIcon className="h-3.5 w-3.5" />
              {product.origin}
            </div>
          )}

          {Number(product.stock) > 0 &&
            Number(product.stock) <= 5 && (
              <p className="mt-3 text-sm font-medium text-amber-600">
                Tersisa {Number(product.stock)}{" "}
                {unitLabel[product.unit]}
              </p>
            )}

          <div className="mt-6">
            <AddToCartButton
              product={{
                id: product.id,
                stepQuantity: Number(product.stepQuantity),
                minOrderQty: Number(product.minOrderQty),
                stock: Number(product.stock),
                unit: product.unit,
              }}
            />
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12 border-t border-dashed border-stone-300 pt-8">
        <h2 className="font-heading text-lg font-semibold text-stone-900">
          Ulasan pembeli
        </h2>

        {currentUser ? (
          <div className="mt-4">
            <ReviewForm slug={product.slug} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-stone-400">
            <a href={`/login?redirect=/produk/${product.slug}`} className="text-emerald-700 hover:underline">
              Masuk
            </a>{" "}
            untuk memberi ulasan.
          </p>
        )}

        {product.reviews.length === 0 ? (
          <p className="mt-3 text-sm text-stone-400">
            Belum ada ulasan untuk produk ini.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-stone-100 pb-4 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-stone-900">
                    {review.user.name}
                  </span>

                  <span className="text-sm text-amber-600">
                    {"⭐".repeat(review.rating)}
                  </span>
                </div>

                {review.comment && (
                  <p className="mt-1 text-sm text-stone-600">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
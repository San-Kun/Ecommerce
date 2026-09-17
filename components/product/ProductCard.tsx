import Link from "next/link";
import { WishlistButton } from "./WishlistButton";

type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  unit: string;
  image: string | null;
  isOrganic: boolean;
  stock: number;
};

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

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-stone-200 bg-white">
      <div className="absolute right-2 top-2 z-10">
        <WishlistButton productId={product.id} />
      </div>

      <Link href={`/produk/${product.slug}`}>
        <div className="aspect-square bg-stone-100">
          {product.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          )}
        </div>

        <div className="p-3">
          {product.isOrganic && (
            <span className="mb-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              Organik
            </span>
          )}
          <h3 className="line-clamp-1 font-medium text-stone-900">{product.name}</h3>
          <p className="mt-1 text-sm text-stone-600">
            {formatRupiah(product.price)}{" "}
            <span className="text-stone-400">/ {unitLabel[product.unit] ?? product.unit.toLowerCase()}</span>
          </p>
          {product.stock === 0 && <p className="mt-1 text-xs text-red-600">Stok habis</p>}
        </div>
      </Link>
    </div>
  );
}

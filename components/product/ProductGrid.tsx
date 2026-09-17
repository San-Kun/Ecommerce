import { ProductCard } from "./ProductCard";

type ProductCardData = Parameters<typeof ProductCard>[0]["product"];

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) {
    return <p className="py-12 text-center text-stone-400">Belum ada produk di kategori ini.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

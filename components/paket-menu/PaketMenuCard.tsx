import Link from "next/link";

type PaketMenuCardData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image: string | null;
  itemCount: number;
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

export function PaketMenuCard({ paketMenu }: { paketMenu: PaketMenuCardData }) {
  return (
    <Link
      href={`/paket-menu/${paketMenu.slug}`}
      className="block overflow-hidden rounded-lg border border-stone-200 bg-white hover:border-emerald-300"
    >
      <div className="aspect-video bg-stone-100">
        {paketMenu.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={paketMenu.image} alt={paketMenu.name} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-stone-900">{paketMenu.name}</h3>
        {paketMenu.description && (
          <p className="mt-1 line-clamp-2 text-sm text-stone-500">{paketMenu.description}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="font-medium text-emerald-700">{formatRupiah(paketMenu.price)}</span>
          <span className="text-xs text-stone-400">{paketMenu.itemCount} bahan</span>
        </div>
      </div>
    </Link>
  );
}

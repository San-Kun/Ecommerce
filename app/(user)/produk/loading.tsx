import { Skeleton, ProductGridSkeleton } from "@/components/common/Skeleton";

export default function LoadingProdukPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Skeleton className="h-11 w-full max-w-md rounded-full" />
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <Skeleton className="mt-6 h-6 w-40" />
      <Skeleton className="mt-2 h-4 w-28" />
      <div className="mt-4">
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}

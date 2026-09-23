import { Skeleton, ProductGridSkeleton } from "@/components/common/Skeleton";

export default function LoadingHome() {
  return (
    <div>
      <Skeleton className="h-48 rounded-none" />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <Skeleton className="mt-6 h-16 w-full rounded-xl" />
        <Skeleton className="mt-10 h-6 w-52" />
        <div className="mt-4">
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </div>
  );
}

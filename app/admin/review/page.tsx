import { prisma } from "@/lib/db";
import { AdminReviewTable } from "@/components/admin/AdminReviewTable";

export default async function AdminReviewPage() {
  const reviews = await prisma.review.findMany({
    include: {
      user: { select: { name: true } },
      product: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-stone-900">Review</h1>
        <p className="text-sm text-stone-500">{reviews.length} ulasan dari pelanggan</p>
      </div>

      <AdminReviewTable
        initialReviews={reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          userName: r.user.name,
          productName: r.product.name,
          productSlug: r.product.slug,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}

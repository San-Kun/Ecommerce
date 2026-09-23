import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { tryAdmin } from "@/lib/api-auth";

type RouteParams = { params: Promise<{ id: string }> };

// DELETE /api/admin/reviews/[id] - moderasi: hapus review lalu hitung ulang rating produk
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const auth = await tryAdmin();
  if (auth.response) return auth.response;

  const { id } = await params;

  const review = await prisma.review.findUnique({ where: { id }, select: { id: true, productId: true } });
  if (!review) {
    return NextResponse.json({ error: "Review tidak ditemukan" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id } });

    const agg = await tx.review.aggregate({
      where: { productId: review.productId },
      _avg: { rating: true },
      _count: true,
    });

    await tx.product.update({
      where: { id: review.productId },
      data: {
        ratingAvg: agg._avg.rating ?? 0,
        reviewCount: agg._count,
      },
    });
  });

  return NextResponse.json({ ok: true });
}

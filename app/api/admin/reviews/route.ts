import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { tryAdmin } from "@/lib/api-auth";

// GET /api/admin/reviews - semua review (admin) dengan pagination, search, filter rating
export async function GET(req: NextRequest) {
  const auth = await tryAdmin();
  if (auth.response) return auth.response;

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));
  const search = searchParams.get("search")?.trim();
  const ratingParam = searchParams.get("rating");
  const rating = ratingParam ? Number(ratingParam) : undefined;

  const where: Prisma.ReviewWhereInput = {
    ...(rating && rating >= 1 && rating <= 5 ? { rating } : {}),
    ...(search
      ? {
          OR: [
            { comment: { contains: search } },
            { product: { name: { contains: search } } },
            { user: { name: { contains: search } } },
          ],
        }
      : {}),
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: { select: { name: true } },
        product: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.review.count({ where }),
  ]);

  return NextResponse.json({
    items: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      userName: r.user.name,
      productName: r.product.name,
      productSlug: r.product.slug,
      createdAt: r.createdAt,
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}

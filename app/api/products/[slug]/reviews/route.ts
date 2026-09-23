import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { tryAuth } from "@/lib/api-auth";
import { createReviewSchema } from "@/lib/validators/review";

type RouteParams = { params: Promise<{ slug: string }> };

// GET /api/products/[slug]/reviews - daftar review produk (publik) + ringkasan rating
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    select: { id: true, ratingAvg: true, reviewCount: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? 10)));

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId: product.id },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.review.count({ where: { productId: product.id } }),
  ]);

  return NextResponse.json({
    summary: {
      ratingAvg: Number(product.ratingAvg),
      reviewCount: product.reviewCount,
    },
    items: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      userName: r.user.name,
      createdAt: r.createdAt,
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}

// POST /api/products/[slug]/reviews - beri rating & review (wajib login + pernah beli)
export async function POST(req: NextRequest, { params }: RouteParams) {
  const auth = await tryAuth();
  if (auth.response) return auth.response;
  const user = auth.user;

  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
  if (!product) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  // Hanya boleh review kalau produk ini pernah dibeli & pesanannya SELESAI.
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId: product.id,
      order: { userId: user.sub, status: "SELESAI" },
    },
    select: { id: true },
  });
  if (!hasPurchased) {
    return NextResponse.json(
      { error: "Hanya bisa memberi review untuk produk yang sudah pernah dibeli dan selesai" },
      { status: 403 }
    );
  }

  // Upsert review (1 user 1 review per produk) + hitung ulang agregat rating produk,
  // semua dalam satu transaksi supaya ratingAvg/reviewCount selalu konsisten.
  const review = await prisma.$transaction(async (tx) => {
    const upserted = await tx.review.upsert({
      where: { userId_productId: { userId: user.sub, productId: product.id } },
      update: { rating: parsed.data.rating, comment: parsed.data.comment },
      create: {
        userId: user.sub,
        productId: product.id,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      },
    });

    const agg = await tx.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
      _count: true,
    });

    await tx.product.update({
      where: { id: product.id },
      data: {
        ratingAvg: agg._avg.rating ?? 0,
        reviewCount: agg._count,
      },
    });

    return upserted;
  });

  return NextResponse.json(review, { status: 201 });
}

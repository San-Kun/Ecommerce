import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, UnauthenticatedError } from "@/lib/auth";
import { addToWishlistSchema } from "@/lib/validators/wishlist";

async function fetchWishlist(userId: string) {
  return prisma.wishlist.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
}

function serializeWishlist(items: Awaited<ReturnType<typeof fetchWishlist>>) {
  return items.map((item) => ({
    id: item.id,
    productId: item.productId,
    productName: item.product.name,
    productSlug: item.product.slug,
    price: Number(item.product.price),
    unit: item.product.unit,
    image: Array.isArray(item.product.images) ? ((item.product.images as string[])[0] ?? null) : null,
  }));
}

export async function GET() {
  try {
    const user = await requireAuth();
    const items = await fetchWishlist(user.sub);
    return NextResponse.json({ items: serializeWishlist(items) });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }
    throw err;
  }
}

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAuth();
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }
    throw err;
  }

  const body = await req.json();
  const parsed = addToWishlistSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }

  // Upsert: kalau sudah pernah di-wishlist sebelumnya, jangan error, biarkan idempotent
  await prisma.wishlist.upsert({
    where: { userId_productId: { userId: user.sub, productId: parsed.data.productId } },
    update: {},
    create: { userId: user.sub, productId: parsed.data.productId },
  });

  const items = await fetchWishlist(user.sub);
  return NextResponse.json({ items: serializeWishlist(items) }, { status: 201 });
}

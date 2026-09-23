import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { tryAdmin } from "@/lib/api-auth";
import { createPaketMenuSchema } from "@/lib/validators/paket-menu";

export async function GET() {
  const paketMenu = await prisma.paketMenu.findMany({
    include: { items: { include: { product: { select: { status: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    items: paketMenu.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: Number(p.price),
      image: p.image,
      itemCount: p.items.length,
    })),
  });
}

// POST /api/paket-menu - buat paket menu baru (admin)
export async function POST(req: NextRequest) {
  const auth = await tryAdmin();
  if (auth.response) return auth.response;

  const body = await req.json();
  const parsed = createPaketMenuSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { name, slug, description, price, image, items } = parsed.data;

  const existing = await prisma.paketMenu.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug sudah dipakai paket lain" }, { status: 409 });
  }

  // Pastikan semua produk yang dipilih benar-benar ada.
  const productIds = items.map((i) => i.productId);
  const found = await prisma.product.count({ where: { id: { in: productIds } } });
  if (found !== new Set(productIds).size) {
    return NextResponse.json({ error: "Ada produk yang tidak ditemukan" }, { status: 400 });
  }

  const created = await prisma.paketMenu.create({
    data: {
      name,
      slug,
      description,
      price,
      image: image || null,
      items: {
        create: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      },
    },
  });

  return NextResponse.json({ id: created.id, slug: created.slug }, { status: 201 });
}

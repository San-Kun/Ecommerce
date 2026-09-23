import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { tryAdmin } from "@/lib/api-auth";
import { updatePaketMenuSchema } from "@/lib/validators/paket-menu";

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  const paketMenu = await prisma.paketMenu.findUnique({
    where: { slug },
    include: { items: { include: { product: true } } },
  });

  if (!paketMenu) {
    return NextResponse.json({ error: "Paket menu tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    id: paketMenu.id,
    name: paketMenu.name,
    slug: paketMenu.slug,
    description: paketMenu.description,
    price: Number(paketMenu.price),
    image: paketMenu.image,
    items: paketMenu.items.map((item) => ({
      productId: item.productId,
      productName: item.product.name,
      productSlug: item.product.slug,
      quantity: item.quantity,
      unit: item.product.unit,
      isAvailable: item.product.status === "AKTIF" && item.product.stock > 0,
    })),
  });
}

// PUT /api/paket-menu/[slug] - update paket menu (admin)
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const auth = await tryAdmin();
  if (auth.response) return auth.response;

  const { slug } = await params;
  const paket = await prisma.paketMenu.findUnique({ where: { slug } });
  if (!paket) {
    return NextResponse.json({ error: "Paket menu tidak ditemukan" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updatePaketMenuSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const data = parsed.data;

  // Kalau slug diubah, pastikan tidak bentrok.
  if (data.slug && data.slug !== paket.slug) {
    const clash = await prisma.paketMenu.findUnique({ where: { slug: data.slug } });
    if (clash) {
      return NextResponse.json({ error: "Slug sudah dipakai paket lain" }, { status: 409 });
    }
  }

  // Validasi produk kalau items dikirim.
  if (data.items) {
    const productIds = data.items.map((i) => i.productId);
    const found = await prisma.product.count({ where: { id: { in: productIds } } });
    if (found !== new Set(productIds).size) {
      return NextResponse.json({ error: "Ada produk yang tidak ditemukan" }, { status: 400 });
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.paketMenu.update({
      where: { id: paket.id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.image !== undefined ? { image: data.image || null } : {}),
      },
    });

    // Kalau items dikirim, ganti seluruh isi paket (hapus lama, buat baru).
    if (data.items) {
      await tx.paketMenuItem.deleteMany({ where: { paketMenuId: paket.id } });
      await tx.paketMenuItem.createMany({
        data: data.items.map((i) => ({ paketMenuId: paket.id, productId: i.productId, quantity: i.quantity })),
      });
    }
  });

  return NextResponse.json({ ok: true });
}

// DELETE /api/paket-menu/[slug] - hapus paket menu (admin)
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const auth = await tryAdmin();
  if (auth.response) return auth.response;

  const { slug } = await params;
  const paket = await prisma.paketMenu.findUnique({ where: { slug } });
  if (!paket) {
    return NextResponse.json({ error: "Paket menu tidak ditemukan" }, { status: 404 });
  }

  // Item paket ikut terhapus otomatis (onDelete: Cascade di skema).
  await prisma.paketMenu.delete({ where: { id: paket.id } });
  return NextResponse.json({ ok: true });
}

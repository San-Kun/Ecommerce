import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

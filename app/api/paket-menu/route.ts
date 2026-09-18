import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

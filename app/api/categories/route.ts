import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { tryAdmin } from "@/lib/api-auth";
import { createCategorySchema } from "@/lib/validators/category";

// GET /api/categories - daftar kategori (publik) beserta jumlah produk aktif
export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });

  return NextResponse.json({
    items: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      productCount: c._count.products,
    })),
  });
}

// POST /api/categories - buat kategori baru (admin)
export async function POST(req: NextRequest) {
  const auth = await tryAdmin();
  if (auth.response) return auth.response;

  const body = await req.json();
  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug kategori sudah dipakai" }, { status: 409 });
  }

  const category = await prisma.category.create({ data: parsed.data });
  return NextResponse.json(category, { status: 201 });
}

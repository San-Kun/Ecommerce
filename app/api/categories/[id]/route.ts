import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { tryAdmin } from "@/lib/api-auth";
import { updateCategorySchema } from "@/lib/validators/category";

type RouteParams = { params: Promise<{ id: string }> };

// PUT /api/categories/[id] - edit kategori (admin)
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const auth = await tryAdmin();
  if (auth.response) return auth.response;

  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  // Kalau slug diubah, pastikan tidak bentrok dengan kategori lain
  if (parsed.data.slug && parsed.data.slug !== category.slug) {
    const clash = await prisma.category.findUnique({ where: { slug: parsed.data.slug } });
    if (clash) {
      return NextResponse.json({ error: "Slug kategori sudah dipakai" }, { status: 409 });
    }
  }

  const updated = await prisma.category.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}

// DELETE /api/categories/[id] - hapus kategori (admin)
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const auth = await tryAdmin();
  if (auth.response) return auth.response;

  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) {
    return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
  }

  // Relasi Product->Category pakai onDelete: Restrict, jadi kategori yang masih
  // punya produk tidak boleh dihapus. Cek dulu supaya errornya ramah.
  if (category._count.products > 0) {
    return NextResponse.json(
      { error: "Kategori masih memiliki produk, pindahkan produk terlebih dahulu" },
      { status: 409 }
    );
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

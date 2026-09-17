import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, UnauthenticatedError } from "@/lib/auth";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  let user;
  try {
    user = await requireAuth();
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }
    throw err;
  }

  const { productId } = await params;
  await prisma.wishlist.deleteMany({ where: { userId: user.sub, productId } });
  return NextResponse.json({ ok: true });
}

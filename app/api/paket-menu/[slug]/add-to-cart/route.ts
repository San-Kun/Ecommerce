import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, UnauthenticatedError } from "@/lib/auth";
import { getQuantityStep, roundToStep, validateQuantity } from "@/lib/unit-helper";
import { getOrCreateCart, fetchCartItems, serializeCart } from "@/lib/cart";

type RouteParams = { params: Promise<{ slug: string }> };

export async function POST(_req: NextRequest, { params }: RouteParams) {
  let user;
  try {
    user = await requireAuth();
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }
    throw err;
  }

  const { slug } = await params;

  const paketMenu = await prisma.paketMenu.findUnique({
    where: { slug },
    include: { items: { include: { product: true } } },
  });

  if (!paketMenu) {
    return NextResponse.json({ error: "Paket menu tidak ditemukan" }, { status: 404 });
  }

  const cart = await getOrCreateCart(user.sub);

  // Best-effort: tambahkan sebanyak mungkin item, catat yang gagal (mis. stok
  // tidak cukup) tanpa membatalkan item lain yang masih berhasil ditambahkan.
  const skipped: { productName: string; reason: string }[] = [];

  for (const item of paketMenu.items) {
    if (item.product.status !== "AKTIF") {
      skipped.push({ productName: item.product.name, reason: "Produk sedang tidak tersedia" });
      continue;
    }

    const existing = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: item.productId } },
    });

    const step = getQuantityStep(item.product);
    const newQuantity = roundToStep((existing ? Number(existing.quantity) : 0) + item.quantity, step);

    const validation = validateQuantity(newQuantity, item.product);
    if (!validation.valid) {
      skipped.push({ productName: item.product.name, reason: validation.message ?? "Kuantitas tidak valid" });
      continue;
    }

    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: item.productId } },
      update: { quantity: newQuantity },
      create: { cartId: cart.id, productId: item.productId, quantity: newQuantity },
    });
  }

  const items = await fetchCartItems(cart.id);

  return NextResponse.json({
    items: serializeCart(items),
    addedCount: paketMenu.items.length - skipped.length,
    skipped,
  });
}

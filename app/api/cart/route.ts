import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, UnauthenticatedError } from "@/lib/auth";
import { addToCartSchema } from "@/lib/validators/cart";
import { validateQuantity, roundToStep, getQuantityStep } from "@/lib/unit-helper";

async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

async function fetchCartItems(cartId: string) {
  return prisma.cartItem.findMany({
    where: { cartId },
    include: { product: true },
    orderBy: { id: "asc" },
  });
}

function serializeCart(items: Awaited<ReturnType<typeof fetchCartItems>>) {
  return items.map((item) => ({
    id: item.id,
    productId: item.productId,
    productName: item.product.name,
    productSlug: item.product.slug,
    price: Number(item.product.price),
    unit: item.product.unit,
    image: Array.isArray(item.product.images) ? ((item.product.images as string[])[0] ?? null) : null,
    stock: item.product.stock,
    stepQuantity: Number(item.product.stepQuantity),
    minOrderQty: Number(item.product.minOrderQty),
    quantity: Number(item.quantity),
  }));
}

export async function GET() {
  try {
    const user = await requireAuth();
    const cart = await getOrCreateCart(user.sub);
    const items = await fetchCartItems(cart.id);
    return NextResponse.json({ items: serializeCart(items) });
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
  const parsed = addToCartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { productId, quantity } = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "AKTIF") {
    return NextResponse.json({ error: "Produk tidak tersedia" }, { status: 404 });
  }

  const cart = await getOrCreateCart(user.sub);
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  // Kalau produk sudah ada di cart, tambahkan ke kuantitas yang sudah ada (bukan overwrite)
  const step = getQuantityStep(product);
  const newQuantity = roundToStep((existing ? Number(existing.quantity) : 0) + quantity, step);

  const validation = validateQuantity(newQuantity, product);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.message }, { status: 400 });
  }

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: newQuantity },
    create: { cartId: cart.id, productId, quantity: newQuantity },
  });

  const items = await fetchCartItems(cart.id);
  return NextResponse.json({ items: serializeCart(items) }, { status: 201 });
}

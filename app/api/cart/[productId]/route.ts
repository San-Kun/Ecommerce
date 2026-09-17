import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, UnauthenticatedError } from "@/lib/auth";
import { updateCartItemSchema } from "@/lib/validators/cart";
import { validateQuantity } from "@/lib/unit-helper";

type RouteParams = { params: Promise<{ productId: string }> };

export async function PUT(req: NextRequest, { params }: RouteParams) {
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
  const body = await req.json();
  const parsed = updateCartItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const cart = await prisma.cart.findUnique({ where: { userId: user.sub } });
  if (!cart) {
    return NextResponse.json({ error: "Keranjang tidak ditemukan" }, { status: 404 });
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
    include: { product: true },
  });
  if (!cartItem) {
    return NextResponse.json({ error: "Item tidak ditemukan di keranjang" }, { status: 404 });
  }

  const validation = validateQuantity(parsed.data.quantity, cartItem.product);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.message }, { status: 400 });
  }

  await prisma.cartItem.update({
    where: { id: cartItem.id },
    data: { quantity: parsed.data.quantity },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
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
  const cart = await prisma.cart.findUnique({ where: { userId: user.sub } });
  if (!cart) {
    return NextResponse.json({ error: "Keranjang tidak ditemukan" }, { status: 404 });
  }

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
  return NextResponse.json({ ok: true });
}

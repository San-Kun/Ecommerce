import { prisma } from "@/lib/db";

export async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function fetchCartItems(cartId: string) {
  return prisma.cartItem.findMany({
    where: { cartId },
    include: { product: true },
    orderBy: { id: "asc" },
  });
}

export function serializeCart(items: Awaited<ReturnType<typeof fetchCartItems>>) {
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

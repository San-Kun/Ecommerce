import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { tryAuth } from "@/lib/api-auth";
import { getOrCreateCart, fetchCartItems, serializeCart } from "@/lib/cart";
import { validateQuantity, roundToStep, getQuantityStep } from "@/lib/unit-helper";

const repeatOrderSchema = z.object({
  orderId: z.string().uuid("Pesanan tidak valid"),
});

// POST /api/orders/repeate - pesan ulang: masukkan kembali item pesanan lama ke keranjang
export async function POST(req: NextRequest) {
  const auth = await tryAuth();
  if (auth.response) return auth.response;
  const user = auth.user;

  const body = await req.json();
  const parsed = repeatOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { id: parsed.data.orderId, userId: user.sub },
    include: { items: { include: { product: true } } },
  });
  if (!order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  const cart = await getOrCreateCart(user.sub);

  // Item yang produknya sudah nonaktif / stok habis dilewati, tidak menggagalkan
  // seluruh proses. Kirim balik daftar item yang dilewati sebagai informasi.
  const skipped: string[] = [];

  for (const item of order.items) {
    const product = item.product;
    if (product.status !== "AKTIF" || product.stock <= 0) {
      skipped.push(product.name);
      continue;
    }

    const existing = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: product.id } },
    });

    const step = getQuantityStep(product);
    const desired = roundToStep(
      (existing ? Number(existing.quantity) : 0) + Number(item.quantity),
      step
    );

    // Batasi ke stok tersedia bila kuantitas gabungan melebihi validasi.
    const validation = validateQuantity(desired, product);
    const finalQty = validation.valid ? desired : roundToStep(product.stock, step);
    if (finalQty <= 0) {
      skipped.push(product.name);
      continue;
    }

    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: product.id } },
      update: { quantity: finalQty },
      create: { cartId: cart.id, productId: product.id, quantity: finalQty },
    });
  }

  const items = await fetchCartItems(cart.id);
  return NextResponse.json({ items: serializeCart(items), skipped }, { status: 201 });
}

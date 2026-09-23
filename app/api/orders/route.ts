import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { requireAuth, UnauthenticatedError } from "@/lib/auth";
import { createOrderSchema } from "@/lib/validators/order";
import { estimateShipping } from "@/lib/shipping";
import { snap } from "@/lib/midtrans";

// Provider pembayaran aktif. Default "manual": pakai Transfer Bank / COD tanpa
// gateway eksternal. Set PAYMENT_PROVIDER=midtrans di .env kalau mau pakai Snap.
const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER ?? "manual";

function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = randomUUID().slice(0, 8).toUpperCase();
  return `ORD-${dateStr}-${suffix}`;
}

export async function GET() {
  try {
    const user = await requireAuth();
    const orders = await prisma.order.findMany({
      where: { userId: user.sub },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      items: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        totalAmount: Number(o.totalAmount),
        itemCount: o.items.length,
        createdAt: o.createdAt,
      })),
    });
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
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { addressId, shippingSchedule, paymentMethod } = parsed.data;

  const [address, cart, userRecord] = await Promise.all([
    prisma.address.findFirst({ where: { id: addressId, userId: user.sub } }),
    prisma.cart.findUnique({ where: { userId: user.sub }, include: { items: { include: { product: true } } } }),
    prisma.user.findUnique({ where: { id: user.sub } }),
  ]);

  if (!address) {
    return NextResponse.json({ error: "Alamat tidak ditemukan" }, { status: 404 });
  }

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Keranjang kosong" }, { status: 400 });
  }

  // Validasi ulang terhadap stok TERKINI -- kuantitas di cart bisa saja sudah basi
  // kalau ada pembeli lain yang lebih dulu checkout produk yang sama.
  const stockIssues: string[] = [];
  for (const item of cart.items) {
    if (item.product.status !== "AKTIF") {
      stockIssues.push(`${item.product.name} sudah tidak tersedia`);
    } else if (Number(item.quantity) > item.product.stock) {
      stockIssues.push(`Stok ${item.product.name} tersisa ${item.product.stock}`);
    }
  }
  if (stockIssues.length > 0) {
    return NextResponse.json({ error: stockIssues.join(", ") }, { status: 409 });
  }

  const shippingResult = estimateShipping({
    latitude: Number(address.latitude),
    longitude: Number(address.longitude),
  });
  if (!shippingResult.ok) {
    return NextResponse.json({ error: shippingResult.reason }, { status: 422 });
  }
  const shippingCost = shippingResult.cost;

  // Hitung subtotal per baris dibulatkan dulu, baru dijumlah -- supaya totalnya
  // konsisten dengan jumlah item_details (dipakai juga kalau provider = midtrans).
  const lineItems = cart.items.map((item) => ({
    item,
    lineSubtotal: Math.round(Number(item.product.price) * Number(item.quantity)),
  }));
  const subtotalAmount = lineItems.reduce((sum, li) => sum + li.lineSubtotal, 0);
  const totalAmount = subtotalAmount + shippingCost;
  const orderNumber = generateOrderNumber();

  // Buat order + potong stok dalam satu transaksi. Untuk Transfer/COD, cart
  // langsung dikosongkan setelah order tercatat karena tidak ada gateway
  // eksternal yang bisa gagal -- pembayaran diselesaikan belakangan (transfer
  // dikonfirmasi admin, atau tunai saat COD diantar).
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        status: "PENDING",
        subtotalAmount,
        shippingCost,
        totalAmount,
        shippingSchedule,
        paymentMethod,
        paymentStatus: "MENUNGGU",
        userId: user.sub,
        addressId: address.id,
        items: {
          create: lineItems.map(({ item, lineSubtotal }) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.product.price,
            subtotal: lineSubtotal,
          })),
        },
      },
    });

    for (const { item } of lineItems) {
      const wholeUnitsSold = Math.ceil(Number(item.quantity));
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: wholeUnitsSold }, soldCount: { increment: wholeUnitsSold } },
      });
    }

    return created;
  });

  // === Jalur Midtrans (opsional, di belakang saklar env) ===
  if (PAYMENT_PROVIDER === "midtrans") {
    try {
      const transaction = await snap.createTransaction({
        transaction_details: { order_id: order.orderNumber, gross_amount: totalAmount },
        user_details: {
          first_name: userRecord?.name ?? "Pelanggan",
          email: userRecord?.email,
          phone: userRecord?.phone ?? undefined,
        },
        item_details: [
          ...lineItems.map(({ item, lineSubtotal }) => ({
            id: item.productId,
            price: lineSubtotal,
            quantity: 1,
            name: `${item.product.name} (${item.quantity} ${item.product.unit.toLowerCase()})`.slice(0, 50),
          })),
          { id: "ONGKIR", price: shippingCost, quantity: 1, name: "Ongkos Kirim" },
        ],
      });

      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

      return NextResponse.json(
        { orderNumber: order.orderNumber, redirectUrl: transaction.redirect_url, token: transaction.token },
        { status: 201 }
      );
    } catch (err) {
      console.error("Gagal createTransaction Midtrans:", err);

      await prisma.$transaction(async (tx) => {
        await tx.order.update({ where: { id: order.id }, data: { status: "DIBATALKAN", paymentStatus: "GAGAL" } });
        for (const { item } of lineItems) {
          const wholeUnitsSold = Math.ceil(Number(item.quantity));
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: wholeUnitsSold }, soldCount: { decrement: wholeUnitsSold } },
          });
        }
      });

      return NextResponse.json({ error: "Gagal membuat transaksi pembayaran, coba lagi" }, { status: 502 });
    }
  }

  // === Jalur Transfer Manual / COD (default) ===
  // Order sudah tercatat, kosongkan keranjang.
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  // TRANSFER -> arahkan ke halaman instruksi transfer.
  // COD       -> langsung ke detail pesanan; bayar saat barang diantar.
  const redirectUrl =
    paymentMethod === "TRANSFER"
      ? `/pembayaran/${order.orderNumber}`
      : `/profil/riwayat`;

  return NextResponse.json(
    { orderNumber: order.orderNumber, paymentMethod, redirectUrl },
    { status: 201 }
  );
}

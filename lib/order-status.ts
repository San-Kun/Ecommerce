import { prisma } from "@/lib/db";

/** Tandai order sudah dibayar. Aman dipanggil berkali-kali (idempotent). */
export async function markOrderPaid(orderNumber: string, transactionId?: string): Promise<void> {
  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order || order.paymentStatus === "BERHASIL") return;

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "BERHASIL",
      status: "DIPROSES",
      midtransTransactionId: transactionId ?? order.midtransTransactionId,
    },
  });
}

/** Tandai order gagal dibayar & kembalikan stok yang sempat dipotong. Idempotent. */
export async function markOrderFailed(orderNumber: string): Promise<void> {
  const order = await prisma.order.findUnique({ where: { orderNumber }, include: { items: true } });
  if (!order || order.paymentStatus === "GAGAL") return;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { paymentStatus: "GAGAL", status: "DIBATALKAN" },
    });

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: Number(item.quantity) } },
      });
    }
  });
}

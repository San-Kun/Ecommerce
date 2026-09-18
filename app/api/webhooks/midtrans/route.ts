import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status, transaction_id } =
    body;

  // Verifikasi signature supaya webhook ini benar-benar dari Midtrans, bukan
  // request palsu yang nyoba nge-set status order jadi BERHASIL tanpa bayar.
  const expectedSignature = crypto
    .createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${process.env.MIDTRANS_SERVER_KEY}`)
    .digest("hex");

  if (expectedSignature !== signature_key) {
    return NextResponse.json({ error: "Signature tidak valid" }, { status: 403 });
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber: order_id },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
  }

  const isSuccess =
    transaction_status === "settlement" || (transaction_status === "capture" && fraud_status === "accept");
  const isFailed = ["deny", "cancel", "expire"].includes(transaction_status);

  if (isSuccess && order.paymentStatus !== "BERHASIL") {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "BERHASIL",
        status: "DIPROSES",
        midtransTransactionId: transaction_id ?? order.midtransTransactionId,
      },
    });
  } else if (isFailed && order.paymentStatus !== "GAGAL") {
    // Pembayaran gagal/batal/kedaluwarsa -> kembalikan stok yang sempat dipotong
    // waktu order dibuat, supaya tidak "hilang" percuma.
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: "GAGAL", status: "DIBATALKAN" },
      });
      for (const item of order.items) {
        const wholeUnitsSold = Math.ceil(Number(item.quantity));
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: wholeUnitsSold } },
        });
      }
    });
  }
  // transaction_status "pending" -> tidak ada perubahan, biarkan status MENUNGGU

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { markOrderPaid, markOrderFailed } from "@/lib/order-status";

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

  const order = await prisma.order.findUnique({ where: { orderNumber: order_id } });
  if (!order) {
    return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
  }

  const isSuccess =
    transaction_status === "settlement" || (transaction_status === "capture" && fraud_status === "accept");
  const isFailed = ["deny", "cancel", "expire"].includes(transaction_status);

  if (isSuccess) {
    await markOrderPaid(order_id, transaction_id);
  } else if (isFailed) {
    await markOrderFailed(order_id);
  }
  // transaction_status "pending" -> tidak ada perubahan, biarkan status MENUNGGU

  return NextResponse.json({ ok: true });
}

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { MockPaymentPanel } from "@/components/payment/MockPaymentPanel";
import { TransferInstructionPanel } from "@/components/payment/TransferInstructionPanel";

const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER ?? "manual";

// Rekening tujuan transfer -- ambil dari env supaya tidak hardcode di kode.
const BANK_INFO = {
  bankName: process.env.STORE_BANK_NAME ?? "BCA",
  accountNumber: process.env.STORE_BANK_ACCOUNT ?? "1234567890",
  accountHolder: process.env.STORE_BANK_HOLDER ?? "SayurKu Indonesia",
};

export default async function PaymentPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) notFound();

  // Hanya pemilik pesanan (atau admin) yang boleh melihat halaman pembayaran.
  if (order.userId !== user.sub && user.role !== "ADMIN") notFound();

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      {PAYMENT_PROVIDER === "mock" ? (
        <MockPaymentPanel
          orderNumber={order.orderNumber}
          totalAmount={Number(order.totalAmount)}
          alreadyResolved={order.paymentStatus !== "MENUNGGU"}
          currentStatus={order.paymentStatus}
        />
      ) : (
        <TransferInstructionPanel
          orderNumber={order.orderNumber}
          totalAmount={Number(order.totalAmount)}
          paymentStatus={order.paymentStatus}
          bank={BANK_INFO}
        />
      )}
    </div>
  );
}

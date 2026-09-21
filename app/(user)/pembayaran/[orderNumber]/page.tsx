import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { MockPaymentPanel } from "@/components/payment/MockPaymentPanel";

export default async function MockPaymentPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <MockPaymentPanel
        orderNumber={order.orderNumber}
        totalAmount={Number(order.totalAmount)}
        alreadyResolved={order.paymentStatus !== "MENUNGGU"}
        currentStatus={order.paymentStatus}
      />
    </div>
  );
}

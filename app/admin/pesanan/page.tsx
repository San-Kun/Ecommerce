import { prisma } from "@/lib/db";
import { AdminOrderTable } from "@/components/admin/AdminOrderTable";

export default async function AdminPesananPage() {
  const orders = await prisma.order.findMany({
    include: { items: true, user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-stone-900">Pesanan</h1>
        <p className="text-sm text-stone-500">{orders.length} pesanan masuk</p>
      </div>

      <AdminOrderTable
        initialOrders={orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          paymentStatus: o.paymentStatus,
          totalAmount: Number(o.totalAmount),
          itemCount: o.items.length,
          userName: o.user.name,
          paymentMethod: o.paymentMethod,
        }))}
      />
    </div>
  );
}

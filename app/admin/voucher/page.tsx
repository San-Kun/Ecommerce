import { prisma } from "@/lib/db";
import { AdminVoucherManager } from "@/components/admin/AdminVoucherManager";

export default async function AdminVoucherPage() {
  const vouchers = await prisma.voucher.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-stone-900">Voucher</h1>
        <p className="text-sm text-stone-500">Kelola kupon diskon untuk pelanggan.</p>
      </div>

      <AdminVoucherManager
        initialVouchers={vouchers.map((v) => ({
          id: v.id,
          code: v.code,
          description: v.description,
          type: v.type,
          value: Number(v.value),
          minSpend: Number(v.minSpend),
          maxDiscount: v.maxDiscount != null ? Number(v.maxDiscount) : null,
          isActive: v.isActive,
          expiresAt: v.expiresAt ? v.expiresAt.toISOString() : null,
          usageLimit: v.usageLimit,
          usedCount: v.usedCount,
        }))}
      />
    </div>
  );
}

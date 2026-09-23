import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { applyVoucherSchema } from "@/lib/validators/voucher";
import { evaluateVoucher } from "@/lib/voucher";

// POST /api/vouchers/validate - cek kode voucher terhadap subtotal, kembalikan potongan.
// Ini hanya preview; sumber kebenaran tetap dihitung ulang saat order dibuat.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = applyVoucherSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const voucher = await prisma.voucher.findUnique({ where: { code: parsed.data.code } });
  const result = evaluateVoucher(voucher, parsed.data.subtotal);

  if (!result.ok) {
    return NextResponse.json({ valid: false, error: result.reason }, { status: 200 });
  }

  return NextResponse.json({
    valid: true,
    code: result.voucher.code,
    discount: result.discount,
    description: result.voucher.description,
  });
}

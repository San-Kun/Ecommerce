import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { markOrderPaid, markOrderFailed } from "@/lib/order-status";

const mockPaymentSchema = z.object({
  outcome: z.enum(["success", "failed"]),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const body = await req.json();
  const parsed = mockPaymentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Outcome tidak valid" }, { status: 400 });
  }

  if (parsed.data.outcome === "success") {
    await markOrderPaid(orderNumber, `MOCK-${Date.now()}`);
  } else {
    await markOrderFailed(orderNumber);
  }

  return NextResponse.json({ ok: true });
}

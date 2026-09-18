import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, UnauthenticatedError } from "@/lib/auth";
import { estimateShipping } from "@/lib/shipping";

export async function GET(req: NextRequest) {
  let user;
  try {
    user = await requireAuth();
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }
    throw err;
  }

  const addressId = req.nextUrl.searchParams.get("addressId");
  if (!addressId) {
    return NextResponse.json({ error: "addressId wajib diisi" }, { status: 400 });
  }

  const address = await prisma.address.findFirst({ where: { id: addressId, userId: user.sub } });
  if (!address) {
    return NextResponse.json({ error: "Alamat tidak ditemukan" }, { status: 404 });
  }

  const result = estimateShipping({ latitude: Number(address.latitude), longitude: Number(address.longitude) });

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 422 });
  }

  return NextResponse.json({ distanceKm: result.distanceKm, shippingCost: result.cost });
}

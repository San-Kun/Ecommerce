import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, UnauthenticatedError } from "@/lib/auth";
import { createAddressSchema } from "@/lib/validators/address";

export async function GET() {
  try {
    const user = await requireAuth();
    const addresses = await prisma.address.findMany({
      where: { userId: user.sub },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      items: addresses.map((a) => ({
        id: a.id,
        label: a.label,
        fullAddress: a.fullAddress,
        latitude: Number(a.latitude),
        longitude: Number(a.longitude),
        isDefault: a.isDefault,
      })),
    });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }
    throw err;
  }
}

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAuth();
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }
    throw err;
  }

  const body = await req.json();
  const parsed = createAddressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({ where: { userId: user.sub }, data: { isDefault: false } });
  }

  const address = await prisma.address.create({
    data: { ...parsed.data, userId: user.sub },
  });

  return NextResponse.json(address, { status: 201 });
}

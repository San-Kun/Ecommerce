// c:/Ikhsan/Ecommerce/app/api/admin/orders/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Logika mengambil data order admin
    return NextResponse.json({ message: "Fetch orders success" });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ message: "Order created", data: body });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 400 });
  }
}
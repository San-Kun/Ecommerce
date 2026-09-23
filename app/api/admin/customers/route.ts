import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { tryAdmin } from "@/lib/api-auth";

// GET /api/admin/customers - daftar customer (admin) dengan pagination & search
export async function GET(req: NextRequest) {
  const auth = await tryAdmin();
  if (auth.response) return auth.response;

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));
  const search = searchParams.get("search")?.trim();

  const where: Prisma.UserWhereInput = {
    role: "USER",
    ...(search
      ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    items: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      orderCount: u._count.orders,
      joinedAt: u.createdAt,
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}

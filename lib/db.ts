import { PrismaClient } from "@prisma/client";

// Mencegah multiple instance PrismaClient saat hot-reload di development
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

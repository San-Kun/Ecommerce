import { prisma } from "./lib/db";

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { contains: "siti" } },
    select: { id: true, email: true, name: true, role: true },
  });
  console.log("USERS_SITI:", JSON.stringify(users, null, 2));

  const order = await prisma.order.findUnique({
    where: { id: "95f61a5f-9c88-4754-8b58-578921766894" },
    select: { id: true, userId: true, orderNumber: true },
  });
  console.log("ORDER:", JSON.stringify(order));

  // Apakah userId order cocok dengan salah satu user siti?
  const match = users.find((u) => u.id === order?.userId);
  console.log("MATCH_OWNER:", match ? match.email : "TIDAK ADA USER SITI DENGAN ID INI");

  await prisma.$disconnect();
}

main();

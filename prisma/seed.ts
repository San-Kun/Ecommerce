import { PrismaClient, Unit, ProductStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ============================================
  // 1. KATEGORI
  // ============================================
  const [sayurDaun, sayurBuah, umbi, bumbuDapur, buah] = await Promise.all([
    prisma.category.upsert({
      where: { slug: "sayur-daun" },
      update: {},
      create: { name: "Sayur Daun", slug: "sayur-daun" },
    }),
    prisma.category.upsert({
      where: { slug: "sayur-buah" },
      update: {},
      create: { name: "Sayur Buah", slug: "sayur-buah" },
    }),
    prisma.category.upsert({
      where: { slug: "umbi-umbian" },
      update: {},
      create: { name: "Umbi-umbian", slug: "umbi-umbian" },
    }),
    prisma.category.upsert({
      where: { slug: "bumbu-dapur" },
      update: {},
      create: { name: "Bumbu Dapur", slug: "bumbu-dapur" },
    }),
    prisma.category.upsert({
      where: { slug: "buah" },
      update: {},
      create: { name: "Buah", slug: "buah" },
    }),
  ]);

  // ============================================
  // 2. PRODUK (25 items)
  // ============================================
  const products = [
    // -- Sayur Daun --
    { name: "Bayam Segar", price: 5000, unit: Unit.IKAT, weightPerUnit: "1 ikat ± 250g", stock: 42, isOrganic: false, origin: "Lembang, Jawa Barat", categoryId: sayurDaun.id },
    { name: "Kangkung", price: 4000, unit: Unit.IKAT, weightPerUnit: "1 ikat ± 200g", stock: 50, isOrganic: false, origin: "Bogor, Jawa Barat", categoryId: sayurDaun.id },
    { name: "Sawi Hijau", price: 6000, unit: Unit.IKAT, weightPerUnit: "1 ikat ± 300g", stock: 35, isOrganic: false, origin: "Lembang, Jawa Barat", categoryId: sayurDaun.id },
    { name: "Sawi Putih", price: 7000, unit: Unit.KG, weightPerUnit: null, stock: 28, isOrganic: false, origin: "Malang, Jawa Timur", categoryId: sayurDaun.id },
    { name: "Bayam Organik", price: 8000, unit: Unit.IKAT, weightPerUnit: "1 ikat ± 250g", stock: 20, isOrganic: true, origin: "Cianjur, Jawa Barat", categoryId: sayurDaun.id },
    { name: "Kale", price: 15000, unit: Unit.IKAT, weightPerUnit: "1 ikat ± 200g", stock: 12, isOrganic: true, origin: "Lembang, Jawa Barat", categoryId: sayurDaun.id },
    { name: "Selada Keriting", price: 9000, unit: Unit.IKAT, weightPerUnit: "1 ikat ± 200g", stock: 24, isOrganic: false, origin: "Lembang, Jawa Barat", categoryId: sayurDaun.id },
    { name: "Daun Singkong", price: 4500, unit: Unit.IKAT, weightPerUnit: "1 ikat ± 300g", stock: 30, isOrganic: false, origin: "Sukabumi, Jawa Barat", categoryId: sayurDaun.id },

    // -- Sayur Buah --
    { name: "Tomat Merah", price: 8000, unit: Unit.KG, weightPerUnit: null, stock: 40, isOrganic: false, origin: "Garut, Jawa Barat", categoryId: sayurBuah.id },
    { name: "Terong Ungu", price: 6000, unit: Unit.KG, weightPerUnit: null, stock: 33, isOrganic: false, origin: "Cianjur, Jawa Barat", categoryId: sayurBuah.id },
    { name: "Timun", price: 5000, unit: Unit.KG, weightPerUnit: null, stock: 45, isOrganic: false, origin: "Sukabumi, Jawa Barat", categoryId: sayurBuah.id },
    { name: "Paprika Merah", price: 25000, unit: Unit.KG, weightPerUnit: null, stock: 15, isOrganic: false, origin: "Malang, Jawa Timur", categoryId: sayurBuah.id },
    { name: "Labu Siam", price: 4000, unit: Unit.KG, weightPerUnit: null, stock: 38, isOrganic: false, origin: "Bogor, Jawa Barat", categoryId: sayurBuah.id },
    { name: "Buncis", price: 7000, unit: Unit.KG, weightPerUnit: null, stock: 27, isOrganic: false, origin: "Lembang, Jawa Barat", categoryId: sayurBuah.id },
    { name: "Jagung Manis", price: 3000, unit: Unit.PCS, weightPerUnit: null, stock: 60, isOrganic: false, origin: "Malang, Jawa Timur", categoryId: sayurBuah.id },

    // -- Umbi-umbian --
    { name: "Kentang", price: 10000, unit: Unit.KG, weightPerUnit: null, stock: 50, isOrganic: false, origin: "Dieng, Jawa Tengah", categoryId: umbi.id },
    { name: "Wortel Organik", price: 9000, unit: Unit.KG, weightPerUnit: null, stock: 30, isOrganic: true, origin: "Lembang, Jawa Barat", categoryId: umbi.id },
    { name: "Bawang Bombay", price: 12000, unit: Unit.KG, weightPerUnit: null, stock: 25, isOrganic: false, origin: "Brebes, Jawa Tengah", categoryId: umbi.id },
    { name: "Singkong", price: 5000, unit: Unit.KG, weightPerUnit: null, stock: 40, isOrganic: false, origin: "Sukabumi, Jawa Barat", categoryId: umbi.id },

    // -- Bumbu Dapur --
    { name: "Cabai Merah", price: 12000, unit: Unit.KG, weightPerUnit: null, stock: 15, isOrganic: false, origin: "Garut, Jawa Barat", categoryId: bumbuDapur.id },
    { name: "Cabai Rawit", price: 15000, unit: Unit.KG, weightPerUnit: null, stock: 18, isOrganic: false, origin: "Garut, Jawa Barat", categoryId: bumbuDapur.id },
    { name: "Bawang Merah", price: 14000, unit: Unit.KG, weightPerUnit: null, stock: 22, isOrganic: false, origin: "Brebes, Jawa Tengah", categoryId: bumbuDapur.id },
    { name: "Bawang Putih", price: 16000, unit: Unit.KG, weightPerUnit: null, stock: 20, isOrganic: false, origin: "Tegal, Jawa Tengah", categoryId: bumbuDapur.id },
    { name: "Jahe", price: 8000, unit: Unit.GRAM, weightPerUnit: "per 250g", stock: 30, isOrganic: false, origin: "Wonosobo, Jawa Tengah", categoryId: bumbuDapur.id },

    // -- Buah --
    { name: "Pisang Ambon", price: 6000, unit: Unit.KG, weightPerUnit: null, stock: 35, isOrganic: false, origin: "Lampung", categoryId: buah.id },
    { name: "Pepaya", price: 5000, unit: Unit.KG, weightPerUnit: null, stock: 20, isOrganic: false, origin: "Bogor, Jawa Barat", categoryId: buah.id },
    { name: "Jeruk Lokal", price: 10000, unit: Unit.KG, weightPerUnit: null, stock: 28, isOrganic: false, origin: "Garut, Jawa Barat", categoryId: buah.id },
  ];

  for (const [index, p] of products.entries()) {
    const slug = p.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        name: p.name,
        slug,
        description: `${p.name} segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.`,
        price: p.price,
        unit: p.unit,
        weightPerUnit: p.weightPerUnit,
        stock: p.stock,
        images: [`https://res.cloudinary.com/demo/image/upload/sayur/${slug}.jpg`],
        isOrganic: p.isOrganic,
        origin: p.origin,
        status: p.stock > 0 ? ProductStatus.AKTIF : ProductStatus.HABIS,
        soldCount: Math.floor(Math.random() * 100),
        categoryId: p.categoryId,
      },
    });

    console.log(`(${index + 1}/${products.length}) Seeded: ${p.name}`);
  }

  console.log("Seed selesai ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

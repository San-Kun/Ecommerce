import { PrismaClient, ProductUnit, OrderStatus, PaymentStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ============================================
// HELPER
// ============================================

async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log("🌱 Mulai seeding...");

  // Optional: Bersihkan data lama agar idempotent saat re-seed
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.paketMenuItem.deleteMany();
  await prisma.paketMenu.deleteMany();
  await prisma.address.deleteMany();

  // ------------------------------------------
  // 1. USERS
  // ------------------------------------------
  const adminPassword = await hashPassword("admin123");
  const userPassword = await hashPassword("user123");

  const admin = await prisma.user.upsert({
    where: { email: "admin@sayurku.id" },
    update: {},
    create: {
      name: "Admin SayurKu",
      email: "admin@sayurku.id",
      passwordHash: adminPassword,
      phone: "081200000001",
      role: Role.ADMIN,
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: "siti.rahayu@gmail.com" },
    update: {},
    create: {
      name: "Siti Rahayu",
      email: "siti.rahayu@gmail.com",
      passwordHash: userPassword,
      phone: "081234567891",
      role: Role.user,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "dewi.lestari@gmail.com" },
    update: {},
    create: {
      name: "Dewi Lestari",
      email: "dewi.lestari@gmail.com",
      passwordHash: userPassword,
      phone: "081234567892",
      role: Role.user,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "ratna.sari@gmail.com" },
    update: {},
    create: {
      name: "Ratna Sari",
      email: "ratna.sari@gmail.com",
      passwordHash: userPassword,
      phone: "081234567893",
      role: Role.user,
    },
  });

  console.log("✅ 4 users (1 admin, 3 user) dibuat");

  // ------------------------------------------
  // 2. ADDRESSES
  // ------------------------------------------
  await prisma.address.createMany({
    data: [
      {
        userId: user1.id,
        label: "Rumah",
        fullAddress: "Jl. Kenanga No. 12, RT 003/RW 005, Kelurahan Cipete Utara, Kebayoran Baru, Jakarta Selatan, 12150",
        latitude: -6.2607,
        longitude: 106.7987,
        isDefault: true,
      },
      {
        userId: user1.id,
        label: "Kantor",
        fullAddress: "Menara BCA Lt. 15, Jl. MH Thamrin No. 1, Jakarta Pusat, 10310",
        latitude: -6.1928,
        longitude: 106.8228,
        isDefault: false,
      },
      {
        userId: user2.id,
        label: "Rumah",
        fullAddress: "Jl. Pahlawan No. 45, Kelurahan Bendungan Hilir, Tanah Abang, Jakarta Pusat, 10210",
        latitude: -6.2088,
        longitude: 106.8125,
        isDefault: true,
      },
      {
        userId: user3.id,
        label: "Rumah",
        fullAddress: "Jl. Melati Indah No. 8, Kelurahan Duren Tiga, Pancoran, Jakarta Selatan, 12760",
        latitude: -6.2456,
        longitude: 106.8395,
        isDefault: true,
      },
    ],
    skipDuplicates: true,
  });

  const address1 = await prisma.address.findFirstOrThrow({ where: { userId: user1.id, isDefault: true } });
  const address2 = await prisma.address.findFirstOrThrow({ where: { userId: user2.id, isDefault: true } });

  console.log("✅ Alamat dibuat");

  // ------------------------------------------
  // 3. CATEGORIES
  // ------------------------------------------
  const categoryData = [
    { name: "Sayur Daun", slug: "sayur-daun" },
    { name: "Sayur Buah", slug: "sayur-buah" },
    { name: "Umbi-umbian", slug: "umbi-umbian" },
    { name: "Bumbu Dapur", slug: "bumbu-dapur" },
    { name: "Sayur Organik", slug: "sayur-organik" },
  ];

  for (const cat of categoryData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const catDaun = await prisma.category.findUniqueOrThrow({ where: { slug: "sayur-daun" } });
  const catBuah = await prisma.category.findUniqueOrThrow({ where: { slug: "sayur-buah" } });
  const catUmbi = await prisma.category.findUniqueOrThrow({ where: { slug: "umbi-umbian" } });
  const catBumbu = await prisma.category.findUniqueOrThrow({ where: { slug: "bumbu-dapur" } });
  const catOrganik = await prisma.category.findUniqueOrThrow({ where: { slug: "sayur-organik" } });

  console.log(`✅ ${categoryData.length} kategori dibuat`);

  // ------------------------------------------
  // 4. PRODUCTS
  // ------------------------------------------
  const productData = [
    // Sayur Daun
    {
      name: "Bayam Hijau",
      slug: "bayam-hijau",
      description: "Bayam segar dipetik pagi hari, cocok untuk sayur bening atau tumis.",
      price: 6000,
      unit: ProductUnit.IKAT,
      weightPerUnit: "1 ikat ± 200g",
      stepQuantity: 1,
      minOrderQty: 1,
      stock: 45,
      images: ["https://images.example.com/bayam-hijau-1.jpg"],
      isOrganic: false,
      origin: "Sukabumi, Jawa Barat",
      categoryId: catDaun.id,
      soldCount: 128,
      ratingAvg: 4.6,
      reviewCount: 12,
    },
    {
      name: "Kangkung",
      slug: "kangkung",
      description: "Kangkung renyah, ideal untuk tumis kangkung terasi atau plecing.",
      price: 4500,
      unit: ProductUnit.IKAT,
      weightPerUnit: "1 ikat ± 250g",
      stepQuantity: 1,
      minOrderQty: 1,
      stock: 60,
      images: ["https://images.example.com/kangkung-1.jpg"],
      isOrganic: false,
      origin: "Bogor, Jawa Barat",
      categoryId: catDaun.id,
      soldCount: 210,
      ratingAvg: 4.7,
      reviewCount: 25,
    },
    {
      name: "Sawi Hijau",
      slug: "sawi-hijau",
      description: "Sawi hijau segar untuk campuran mie ayam atau tumisan.",
      price: 5000,
      unit: ProductUnit.IKAT,
      weightPerUnit: "1 ikat ± 200g",
      stepQuantity: 1,
      minOrderQty: 1,
      stock: 38,
      images: ["https://images.example.com/sawi-hijau-1.jpg"],
      isOrganic: false,
      origin: "Lembang, Jawa Barat",
      categoryId: catDaun.id,
      soldCount: 95,
      ratingAvg: 4.5,
      reviewCount: 9,
    },
    {
      name: "Daun Kemangi",
      slug: "daun-kemangi",
      description: "Kemangi wangi untuk lalapan atau campuran pepes.",
      price: 3000,
      unit: ProductUnit.IKAT,
      weightPerUnit: "1 ikat ± 50g",
      stepQuantity: 1,
      minOrderQty: 1,
      stock: 30,
      images: ["https://images.example.com/kemangi-1.jpg"],
      isOrganic: false,
      origin: "Cianjur, Jawa Barat",
      categoryId: catDaun.id,
      soldCount: 40,
      ratingAvg: 4.4,
      reviewCount: 5,
    },
    // Sayur Buah
    {
      name: "Tomat Merah",
      slug: "tomat-merah",
      description: "Tomat merah segar dan matang sempurna, cocok untuk sambal atau sayur sop.",
      price: 12000,
      unit: ProductUnit.KG,
      weightPerUnit: null,
      stepQuantity: 0.25,
      minOrderQty: 0.25,
      stock: 80,
      images: ["https://images.example.com/tomat-merah-1.jpg"],
      isOrganic: false,
      origin: "Malang, Jawa Timur",
      categoryId: catBuah.id,
      soldCount: 302,
      ratingAvg: 4.8,
      reviewCount: 44,
    },
    {
      name: "Wortel",
      slug: "wortel",
      description: "Wortel manis dan renyah, bagus untuk sayur sop atau jus.",
      price: 10000,
      unit: ProductUnit.KG,
      weightPerUnit: null,
      stepQuantity: 0.25,
      minOrderQty: 0.25,
      stock: 70,
      images: ["https://images.example.com/wortel-1.jpg"],
      isOrganic: false,
      origin: "Lembang, Jawa Barat",
      categoryId: catBuah.id,
      soldCount: 258,
      ratingAvg: 4.7,
      reviewCount: 38,
    },
    {
      name: "Buncis",
      slug: "buncis",
      description: "Buncis muda dan renyah, cocok untuk sayur sop atau capcay.",
      price: 8000,
      unit: ProductUnit.KG,
      weightPerUnit: null,
      stepQuantity: 0.25,
      minOrderQty: 0.25,
      stock: 55,
      images: ["https://images.example.com/buncis-1.jpg"],
      isOrganic: false,
      origin: "Cipanas, Jawa Barat",
      categoryId: catBuah.id,
      soldCount: 140,
      ratingAvg: 4.5,
      reviewCount: 17,
    },
    {
      name: "Timun",
      slug: "timun",
      description: "Timun segar untuk lalapan, acar, atau infused water.",
      price: 6000,
      unit: ProductUnit.KG,
      weightPerUnit: null,
      stepQuantity: 0.25,
      minOrderQty: 0.25,
      stock: 65,
      images: ["https://images.example.com/timun-1.jpg"],
      isOrganic: false,
      origin: "Sukabumi, Jawa Barat",
      categoryId: catBuah.id,
      soldCount: 110,
      ratingAvg: 4.4,
      reviewCount: 14,
    },
    {
      name: "Labu Siam",
      slug: "labu-siam",
      description: "Labu siam segar, favorit untuk sayur lodeh dan tumisan.",
      price: 5000,
      unit: ProductUnit.PCS,
      weightPerUnit: "± 400g per buah",
      stepQuantity: 1,
      minOrderQty: 1,
      stock: 40,
      images: ["https://images.example.com/labu-siam-1.jpg"],
      isOrganic: false,
      origin: "Garut, Jawa Barat",
      categoryId: catBuah.id,
      soldCount: 76,
      ratingAvg: 4.3,
      reviewCount: 8,
    },
    // Umbi-umbian
    {
      name: "Kentang",
      slug: "kentang",
      description: "Kentang berkualitas untuk sayur sop, balado, atau digoreng.",
      price: 15000,
      unit: ProductUnit.KG,
      weightPerUnit: null,
      stepQuantity: 0.25,
      minOrderQty: 0.25,
      stock: 90,
      images: ["https://images.example.com/kentang-1.jpg"],
      isOrganic: false,
      origin: "Dieng, Jawa Tengah",
      categoryId: catUmbi.id,
      soldCount: 315,
      ratingAvg: 4.8,
      reviewCount: 52,
    },
    {
      name: "Bawang Merah",
      slug: "bawang-merah",
      description: "Bawang merah lokal aroma kuat, bumbu dasar masakan Indonesia.",
      price: 32000,
      unit: ProductUnit.KG,
      weightPerUnit: null,
      stepQuantity: 0.25,
      minOrderQty: 0.25,
      stock: 50,
      images: ["https://images.example.com/bawang-merah-1.jpg"],
      isOrganic: false,
      origin: "Brebes, Jawa Tengah",
      categoryId: catUmbi.id,
      soldCount: 289,
      ratingAvg: 4.9,
      reviewCount: 61,
    },
    {
      name: "Bawang Putih",
      slug: "bawang-putih",
      description: "Bawang putih segar dan wangi, wajib ada di dapur.",
      price: 35000,
      unit: ProductUnit.KG,
      weightPerUnit: null,
      stepQuantity: 0.25,
      minOrderQty: 0.25,
      stock: 48,
      images: ["https://images.example.com/bawang-putih-1.jpg"],
      isOrganic: false,
      origin: "Tegal, Jawa Tengah",
      categoryId: catUmbi.id,
      soldCount: 275,
      ratingAvg: 4.8,
      reviewCount: 49,
    },
    // Bumbu Dapur
    {
      name: "Cabai Merah Keriting",
      slug: "cabai-merah-keriting",
      description: "Cabai merah keriting pedas segar untuk sambal dan bumbu masak.",
      price: 45000,
      unit: ProductUnit.KG,
      weightPerUnit: null,
      stepQuantity: 0.1,
      minOrderQty: 0.1,
      stock: 35,
      images: ["https://images.example.com/cabai-merah-1.jpg"],
      isOrganic: false,
      origin: "Wonosobo, Jawa Tengah",
      categoryId: catBumbu.id,
      soldCount: 401,
      ratingAvg: 4.7,
      reviewCount: 70,
    },
    {
      name: "Cabai Rawit Hijau",
      slug: "cabai-rawit-hijau",
      description: "Cabai rawit hijau segar, favorit untuk sambal dadak.",
      price: 40000,
      unit: ProductUnit.KG,
      weightPerUnit: null,
      stepQuantity: 0.1,
      minOrderQty: 0.1,
      stock: 30,
      images: ["https://images.example.com/cabai-rawit-1.jpg"],
      isOrganic: false,
      origin: "Blitar, Jawa Timur",
      categoryId: catBumbu.id,
      soldCount: 198,
      ratingAvg: 4.6,
      reviewCount: 33,
    },
    {
      name: "Jahe",
      slug: "jahe",
      description: "Jahe segar untuk wedang atau bumbu masakan.",
      price: 28000,
      unit: ProductUnit.KG,
      weightPerUnit: null,
      stepQuantity: 0.1,
      minOrderQty: 0.1,
      stock: 25,
      images: ["https://images.example.com/jahe-1.jpg"],
      isOrganic: false,
      origin: "Boyolali, Jawa Tengah",
      categoryId: catBumbu.id,
      soldCount: 88,
      ratingAvg: 4.5,
      reviewCount: 11,
    },
    // Sayur Organik
    {
      name: "Selada Organik",
      slug: "selada-organik",
      description: "Selada organik tanpa pestisida, segar untuk salad dan burger.",
      price: 15000,
      unit: ProductUnit.PCS,
      weightPerUnit: "± 200g per pcs",
      stepQuantity: 1,
      minOrderQty: 1,
      stock: 20,
      images: ["https://images.example.com/selada-organik-1.jpg"],
      isOrganic: true,
      origin: "Lembang, Jawa Barat (kebun organik bersertifikat)",
      categoryId: catOrganik.id,
      soldCount: 54,
      ratingAvg: 4.9,
      reviewCount: 19,
    },
    {
      name: "Brokoli Organik",
      slug: "brokoli-organik",
      description: "Brokoli organik segar, kaya serat dan cocok untuk MPASI.",
      price: 25000,
      unit: ProductUnit.PCS,
      weightPerUnit: "± 350g per pcs",
      stepQuantity: 1,
      minOrderQty: 1,
      stock: 18,
      images: ["https://images.example.com/brokoli-organik-1.jpg"],
      isOrganic: true,
      origin: "Cipanas, Jawa Barat (kebun organik bersertifikat)",
      categoryId: catOrganik.id,
      soldCount: 61,
      ratingAvg: 4.9,
      reviewCount: 22,
    },
  ];

  for (const p of productData) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p as any,
    });
  }

  console.log(`✅ ${productData.length} produk dibuat`);

  const bayam = await prisma.product.findUniqueOrThrow({ where: { slug: "bayam-hijau" } });
  const kangkung = await prisma.product.findUniqueOrThrow({ where: { slug: "kangkung" } });
  const tomat = await prisma.product.findUniqueOrThrow({ where: { slug: "tomat-merah" } });
  const wortel = await prisma.product.findUniqueOrThrow({ where: { slug: "wortel" } });
  const buncis = await prisma.product.findUniqueOrThrow({ where: { slug: "buncis" } });
  const kentang = await prisma.product.findUniqueOrThrow({ where: { slug: "kentang" } });
  const bawangMerah = await prisma.product.findUniqueOrThrow({ where: { slug: "bawang-merah" } });
  const bawangPutih = await prisma.product.findUniqueOrThrow({ where: { slug: "bawang-putih" } });
  const cabaiMerah = await prisma.product.findUniqueOrThrow({ where: { slug: "cabai-merah-keriting" } });
  const daunKemangi = await prisma.product.findUniqueOrThrow({ where: { slug: "daun-kemangi" } });
  const labuSiam = await prisma.product.findUniqueOrThrow({ where: { slug: "labu-siam" } });

  // ------------------------------------------
  // 5. PAKET MENU
  // ------------------------------------------
  const paketSop = await prisma.paketMenu.upsert({
    where: { slug: "paket-sayur-sop" },
    update: {},
    create: {
      name: "Paket Sayur Sop",
      slug: "paket-sayur-sop",
      description: "Semua bahan siap untuk sayur sop hangat: wortel, kentang, buncis, dan bawang.",
      price: 28000,
      image: "https://images.example.com/paket-sayur-sop.jpg",
    },
  });

  const paketTumisKangkung = await prisma.paketMenu.upsert({
    where: { slug: "paket-tumis-kangkung" },
    update: {},
    create: {
      name: "Paket Tumis Kangkung",
      slug: "paket-tumis-kangkung",
      description: "Kangkung, bawang putih, dan cabai — tinggal tumis, siap disajikan.",
      price: 15000,
      image: "https://images.example.com/paket-tumis-kangkung.jpg",
    },
  });

  const paketLodeh = await prisma.paketMenu.upsert({
    where: { slug: "paket-sayur-lodeh" },
    update: {},
    create: {
      name: "Paket Sayur Lodeh",
      slug: "paket-sayur-lodeh",
      description: "Labu siam, kacang panjang pengganti buncis, dan bumbu dasar lodeh.",
      price: 22000,
      image: "https://images.example.com/paket-sayur-lodeh.jpg",
    },
  });

  await prisma.paketMenuItem.createMany({
    data: [
      { paketMenuId: paketSop.id, productId: wortel.id, quantity: 1 },
      { paketMenuId: paketSop.id, productId: kentang.id, quantity: 1 },
      { paketMenuId: paketSop.id, productId: buncis.id, quantity: 1 },
      { paketMenuId: paketSop.id, productId: bawangMerah.id, quantity: 1 },
      { paketMenuId: paketTumisKangkung.id, productId: kangkung.id, quantity: 2 },
      { paketMenuId: paketTumisKangkung.id, productId: bawangPutih.id, quantity: 1 },
      { paketMenuId: paketTumisKangkung.id, productId: cabaiMerah.id, quantity: 1 },
      { paketMenuId: paketLodeh.id, productId: labuSiam.id, quantity: 2 },
      { paketMenuId: paketLodeh.id, productId: bawangMerah.id, quantity: 1 },
      { paketMenuId: paketLodeh.id, productId: cabaiMerah.id, quantity: 1 },
    ],
    skipDuplicates: true,
  });

  console.log("✅ 3 paket menu + item-nya dibuat");

  // ------------------------------------------
  // 6. REVIEWS
  // ------------------------------------------
  await prisma.review.createMany({
    data: [
      { userId: user1.id, productId: bayam.id, rating: 5, comment: "Segar banget, langsung dimasak sore itu juga." },
      { userId: user2.id, productId: bayam.id, rating: 4, comment: "Bagus, tapi ada beberapa daun yang layu." },
      { userId: user1.id, productId: kangkung.id, rating: 5, comment: "Kangkungnya renyah, cocok buat tumis terasi." },
      { userId: user3.id, productId: tomat.id, rating: 5, comment: "Tomatnya matang pas, manis dan nggak lembek." },
      { userId: user2.id, productId: kentang.id, rating: 5, comment: "Ukurannya seragam, enak buat balado." },
      { userId: user3.id, productId: cabaiMerah.id, rating: 4, comment: "Pedasnya pas, tapi pengiriman agak telat." },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Review dibuat");

  // ------------------------------------------
  // 7. WISHLIST
  // ------------------------------------------
  await prisma.wishlist.createMany({
    data: [
      { userId: user1.id, productId: cabaiMerah.id },
      { userId: user1.id, productId: daunKemangi.id },
      { userId: user2.id, productId: bayam.id },
      { userId: user3.id, productId: wortel.id },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Wishlist dibuat");

  // ------------------------------------------
  // 8. CART
  // ------------------------------------------
  const cart1 = await prisma.cart.upsert({
    where: { userId: user1.id },
    update: {},
    create: { userId: user1.id },
  });

  await prisma.cartItem.createMany({
    data: [
      { cartId: cart1.id, productId: bayam.id, quantity: 2 },
      { cartId: cart1.id, productId: tomat.id, quantity: 0.5 },
      { cartId: cart1.id, productId: bawangPutih.id, quantity: 0.25 },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Cart aktif untuk Siti Rahayu dibuat");

  // ------------------------------------------
  // 9. ORDERS
  // ------------------------------------------

  // Order 1 - selesai, sudah dibayar (27.000 subtotal + 8.000 ongkir = 35.000)
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "ORD-20260901-0001",
      status: OrderStatus.SELESAI,
      subtotalAmount: 27000,
      shippingCost: 8000,
      totalAmount: 35000,
      shippingSchedule: "Pagi, 07.00 - 09.00",
      paymentMethod: "Gopay",
      paymentStatus: PaymentStatus.BERHASIL,
      midtransTransactionId: "MT-TRX-0001",
      userId: user1.id,
      addressId: address1.id,
      createdAt: new Date("2026-09-01T06:30:00Z"),
    },
  });

  await prisma.orderItem.createMany({
    data: [
      { orderId: order1.id, productId: bayam.id, quantity: 2, priceAtPurchase: 6000, subtotal: 12000 },
      { orderId: order1.id, productId: tomat.id, quantity: 1, priceAtPurchase: 12000, subtotal: 12000 },
      { orderId: order1.id, productId: daunKemangi.id, quantity: 1, priceAtPurchase: 3000, subtotal: 3000 },
    ],
  });

  // Order 2 - sedang dikirim
  const order2 = await prisma.order.create({
    data: {
      orderNumber: "ORD-20260913-0002",
      status: OrderStatus.DIKIRIM,
      subtotalAmount: 43000,
      shippingCost: 9000,
      totalAmount: 52000,
      shippingSchedule: "Sore, 15.00 - 17.00",
      paymentMethod: "Bank Transfer",
      paymentStatus: PaymentStatus.BERHASIL,
      midtransTransactionId: "MT-TRX-0002",
      userId: user2.id,
      addressId: address2.id,
      createdAt: new Date("2026-09-13T10:00:00Z"),
    },
  });

  await prisma.orderItem.createMany({
    data: [
      { orderId: order2.id, productId: kentang.id, quantity: 1, priceAtPurchase: 15000, subtotal: 15000 },
      { orderId: order2.id, productId: wortel.id, quantity: 1, priceAtPurchase: 10000, subtotal: 10000 },
      { orderId: order2.id, productId: buncis.id, quantity: 1, priceAtPurchase: 8000, subtotal: 8000 },
      { orderId: order2.id, productId: cabaiMerah.id, quantity: 0.2, priceAtPurchase: 45000, subtotal: 9000 },
    ],
  });

  // Order 3 - menunggu pembayaran
  const order3 = await prisma.order.create({
    data: {
      orderNumber: "ORD-20260915-0003",
      status: OrderStatus.PENDING,
      subtotalAmount: 28000,
      shippingCost: 8000,
      totalAmount: 36000,
      shippingSchedule: "Pagi, 08.00 - 10.00",
      paymentMethod: null,
      paymentStatus: PaymentStatus.MENUNGGU,
      midtransTransactionId: null,
      userId: user1.id,
      addressId: address1.id,
    },
  });

  await prisma.orderItem.createMany({
    data: [
      { orderId: order3.id, productId: wortel.id, quantity: 1, priceAtPurchase: 10000, subtotal: 10000 },
      { orderId: order3.id, productId: kentang.id, quantity: 1, priceAtPurchase: 15000, subtotal: 15000 },
      { orderId: order3.id, productId: bawangMerah.id, quantity: 0.1, priceAtPurchase: 32000, subtotal: 3000 },
    ],
  });

  console.log("✅ 3 order contoh (SELESAI, DIKIRIM, PENDING) dibuat");

  console.log("🌱 Seeding selesai!");
  console.log("\nAkun login untuk testing:");
  console.log("  Admin    -> admin@sayurku.id / admin123");
  console.log("  user -> siti.rahayu@gmail.com / user123");
  console.log("  user -> dewi.lestari@gmail.com / user123");
  console.log("  user -> ratna.sari@gmail.com / user123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
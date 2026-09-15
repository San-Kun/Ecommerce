# 🥬 SayurKu — E-commerce Sayur Segar

Platform belanja sayur online yang dirancang khusus untuk kebutuhan ibu rumah tangga dan ART — belanja cepat, satuan jelas, dan bisa langsung beli berdasarkan menu masakan yang mau dibuat.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

<!--
  Ganti dengan screenshot atau GIF demo aplikasi
  Contoh: ![Demo](./docs/demo.gif)
-->

## 📖 Tentang Proyek

SayurKu adalah proyek portofolio personal berupa aplikasi e-commerce untuk penjualan sayur segar. Proyek ini dibangun untuk menunjukkan kemampuan fullstack development, mulai dari desain database, autentikasi, integrasi payment gateway, hingga optimasi pengalaman pengguna berbasis riset target pasar nyata.

### Target Pengguna

Ibu rumah tangga dan ART yang:
- Berbelanja kebutuhan dapur secara rutin (harian/2-3 hari sekali)
- Sensitif terhadap harga dan kesegaran produk
- Sering berbelanja lewat HP di sela aktivitas rumah tangga
- Kadang bingung menentukan bahan berdasarkan menu yang ingin dimasak

### Masalah yang Diselesaikan

- ❌ Repot pergi ke pasar/tukang sayur keliling
- ❌ Sulit memastikan kesegaran produk saat belanja online
- ❌ Bingung satuan (berapa gram dalam 1 ikat kangkung?)
- ❌ Sering lupa membeli sesuatu untuk masakan tertentu

## ✨ Fitur

### Fitur Utama
- 🛒 Katalog produk dengan pencarian dan filter (kategori, harga, organik)
- 📦 Detail produk lengkap dengan satuan jelas (kg/ikat/pcs) dan estimasi porsi
- 🛍️ Keranjang belanja dengan validasi kuantitas sesuai jenis satuan
- 💳 Checkout dengan estimasi ongkir berdasarkan jarak lokasi
- 🔐 Autentikasi pengguna dengan JWT
- 📜 Riwayat pesanan dengan fitur "beli lagi"

### Fitur Pembeda
- 🍲 **Paket Menu Masakan** — beli bahan sekaligus berdasarkan resep (mis. "Paket Sayur Sop"), bukan cari satuan satu-satu
- ⭐ Rating & ulasan produk untuk transparansi kualitas
- ❤️ Wishlist produk favorit
- 🚚 Jadwal pengantaran fleksibel (pagi/sore)

### Panel Admin
- 📊 Kelola stok dan status produk
- 📋 Kelola pesanan masuk

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js (App Router), Tailwind CSS |
| Backend | Next.js API Routes |
| Database | MySQL + Prisma ORM |
| Autentikasi | JWT Token |
| State Management | Zustand (client state), TanStack Query (server state) |
| Payment Gateway | Midtrans (Sandbox) |
| Penyimpanan Gambar | Cloudinary |
| Deployment | Vercel |

## 📁 Struktur Proyek

```
sayurku/
├── app/
│   ├── (customer)/                    # Route group untuk halaman customer
│   │   ├── page.tsx                   # Halaman utama
│   │   ├── kategori/
│   │   │   └── page.tsx               # Halaman kategori + filter
│   │   ├── produk/
│   │   │   └── [slug]/
│   │   │       └── page.tsx           # Detail produk
│   │   ├── paket-menu/
│   │   │   └── [slug]/
│   │   │       └── page.tsx           # Detail paket menu masakan
│   │   ├── cart/
│   │   │   └── page.tsx               # Halaman keranjang
│   │   ├── checkout/
│   │   │   └── page.tsx               # Halaman checkout
│   │   ├── profil/
│   │   │   ├── page.tsx               # Profil utama
│   │   │   ├── riwayat/
│   │   │   │   └── page.tsx           # Riwayat pesanan
│   │   │   └── wishlist/
│   │   │       └── page.tsx           # Wishlist
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   │
│   ├── admin/                         # Route group untuk dashboard admin
│   │   ├── layout.tsx                 # Layout khusus admin (sidebar, dll)
│   │   ├── page.tsx                   # Dashboard overview
│   │   ├── produk/
│   │   │   └── page.tsx               # Kelola produk & stok
│   │   └── pesanan/
│   │       └── page.tsx               # Kelola pesanan masuk
│   │
│   ├── api/                           # Backend (Route Handlers)
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── me/route.ts
│   │   ├── products/
│   │   │   ├── route.ts               # GET (list+filter), POST
│   │   │   └── [slug]/
│   │   │       ├── route.ts           # GET, PUT, DELETE
│   │   │       ├── stock/route.ts
│   │   │       └── reviews/route.ts
│   │   ├── categories/route.ts
│   │   ├── paket-menu/
│   │   │   ├── route.ts
│   │   │   └── [slug]/route.ts
│   │   ├── wishlist/
│   │   │   ├── route.ts
│   │   │   └── [productId]/route.ts
│   │   ├── shipping/
│   │   │   └── estimate/route.ts
│   │   ├── orders/
│   │   │   ├── route.ts               # POST (checkout), GET (riwayat)
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── status/route.ts
│   │   │       └── repeat/route.ts
│   │   ├── webhooks/
│   │   │   └── midtrans/route.ts
│   │   └── admin/
│   │       ├── orders/route.ts
│   │       └── stats/route.ts
│   │
│   ├── layout.tsx                     # Root layout (font, provider global)
│   └── globals.css                    # Tailwind base
│
├── components/
│   ├── ui/                            # Komponen dasar reusable (Button, Input, Chip, dll)
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   └── QuantityStepper.tsx        # Stepper yang sadar satuan (kg/ikat/pcs)
│   ├── cart/
│   │   └── CartItem.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── BottomNav.tsx              # Navigasi bawah mobile
│   │   └── Footer.tsx
│   └── admin/
│       └── ProductTable.tsx
│
├── lib/
│   ├── db.ts                          # Koneksi Prisma client
│   ├── jwt.ts                         # Sign/verify token
│   ├── auth.ts                        # Helper cek session dari cookie
│   ├── shipping.ts                    # Kalkulasi ongkir (Haversine)
│   ├── unit-helper.ts                 # getQuantityStep(), formatUnit()
│   ├── midtrans.ts                    # Konfigurasi client Midtrans
│   ├── cloudinary.ts                  # Upload helper
│   └── validators/                    # Skema validasi input (mis. Zod)
│       ├── auth.ts
│       ├── product.ts
│       └── order.ts
│
├── store/                             # Zustand store (client state)
│   ├── useCartStore.ts
│   ├── useWishlistStore.ts
│   └── useFilterStore.ts              # State filter kategori/harga aktif
│
├── hooks/                             # Custom hooks (bisa dikombinasi TanStack Query)
│   ├── useProducts.ts
│   └── useOrders.ts
│
├── types/
│   └── index.ts                       # Shared TypeScript types
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── public/
│   └── images/
│
├── middleware.ts                      # Proteksi route admin/checkout via JWT
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── package.json
└── README.md                    # Zustand store (cart, wishlist, dll)
```

## 🚀 Cara Install & Menjalankan

### Prasyarat
- Node.js v18 atau lebih baru
- PostgreSQL (lokal atau layanan seperti [Neon](https://neon.tech)/[Supabase](https://supabase.com))
- Akun [Cloudinary](https://cloudinary.com) (gratis)
- Akun [Midtrans Sandbox](https://dashboard.sandbox.midtrans.com)

### Langkah Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/username/sayurku.git
   cd sayurku
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**

   Salin `.env.example` menjadi `.env`, lalu isi sesuai kredensial masing-masing:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/sayurku"
   JWT_SECRET="ganti-dengan-secret-key-yang-kuat"
   CLOUDINARY_CLOUD_NAME="..."
   CLOUDINARY_API_KEY="..."
   CLOUDINARY_API_SECRET="..."
   MIDTRANS_SERVER_KEY="..."
   MIDTRANS_CLIENT_KEY="..."
   NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false
   ```

4. **Migrasi database**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Isi data dummy (seed)**
   ```bash
   npx prisma db seed
   ```

6. **Jalankan development server**
   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📸 Screenshot & Demo

| Halaman Utama | Detail Produk | Checkout |
|---|---|---|
| _[screenshot]_ | _[screenshot]_ | _[screenshot]_ |

<!-- Sertakan link demo GIF atau video singkat di sini, contoh: -->
<!-- ![Demo Alur Belanja](./docs/demo-alur-belanja.gif) -->

**🔗 Live Demo:** [sayurku.vercel.app](#) *(update dengan link setelah deploy)*

## 🗺️ Roadmap Pengembangan Selanjutnya

- [ ] Notifikasi real-time status pesanan
- [ ] Fitur reminder stok dapur untuk repeat order otomatis
- [ ] Multi-alamat tersimpan per pengguna
- [ ] Dashboard analitik penjualan untuk admin

## 📄 Lisensi

Proyek ini dibuat untuk keperluan portofolio pribadi dan tersedia di bawah lisensi [MIT](LICENSE).

## 👤 Kontak

**[Nama Kamu]**
- Portfolio: [link]
- LinkedIn: [link]
- Email: [email]

-- ============================================
-- Seed Data - E-commerce Sayur (SayurKu)
-- Jalankan setelah schema_mysql.sql
-- ============================================

SET NAMES utf8mb4;

-- ============================================
-- 1. KATEGORI
-- ID dibuat eksplisit (bukan UUID() otomatis) supaya bisa direferensikan
-- langsung oleh tabel products di bawah tanpa perlu variable/session.
-- ============================================

INSERT INTO categories (id, name, slug) VALUES
  ('c0000000-0000-4000-8000-000000000001', 'Sayur Daun',    'sayur-daun'),
  ('c0000000-0000-4000-8000-000000000002', 'Sayur Buah',    'sayur-buah'),
  ('c0000000-0000-4000-8000-000000000003', 'Umbi-umbian',   'umbi-umbian'),
  ('c0000000-0000-4000-8000-000000000004', 'Bumbu Dapur',   'bumbu-dapur'),
  ('c0000000-0000-4000-8000-000000000005', 'Buah',          'buah')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ============================================
-- 2. PRODUK (27 items)
-- images disimpan sebagai JSON array berisi URL Cloudinary (placeholder)
-- ============================================

INSERT INTO products
  (id, name, slug, description, price, unit, weight_per_unit, stock, images, is_organic, origin, status, sold_count, category_id)
VALUES

-- -- Sayur Daun --
(UUID(), 'Bayam Segar', 'bayam-segar',
 'Bayam Segar segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 5000, 'IKAT', '1 ikat ± 250g', 42,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/bayam-segar.jpg'),
 FALSE, 'Lembang, Jawa Barat', 'AKTIF', 38, 'c0000000-0000-4000-8000-000000000001'),

(UUID(), 'Kangkung', 'kangkung',
 'Kangkung segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 4000, 'IKAT', '1 ikat ± 200g', 50,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/kangkung.jpg'),
 FALSE, 'Bogor, Jawa Barat', 'AKTIF', 64, 'c0000000-0000-4000-8000-000000000001'),

(UUID(), 'Sawi Hijau', 'sawi-hijau',
 'Sawi Hijau segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 6000, 'IKAT', '1 ikat ± 300g', 35,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/sawi-hijau.jpg'),
 FALSE, 'Lembang, Jawa Barat', 'AKTIF', 21, 'c0000000-0000-4000-8000-000000000001'),

(UUID(), 'Sawi Putih', 'sawi-putih',
 'Sawi Putih segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 7000, 'KG', NULL, 28,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/sawi-putih.jpg'),
 FALSE, 'Malang, Jawa Timur', 'AKTIF', 17, 'c0000000-0000-4000-8000-000000000001'),

(UUID(), 'Bayam Organik', 'bayam-organik',
 'Bayam Organik segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 8000, 'IKAT', '1 ikat ± 250g', 20,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/bayam-organik.jpg'),
 TRUE, 'Cianjur, Jawa Barat', 'AKTIF', 12, 'c0000000-0000-4000-8000-000000000001'),

(UUID(), 'Kale', 'kale',
 'Kale segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 15000, 'IKAT', '1 ikat ± 200g', 12,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/kale.jpg'),
 TRUE, 'Lembang, Jawa Barat', 'AKTIF', 9, 'c0000000-0000-4000-8000-000000000001'),

(UUID(), 'Selada Keriting', 'selada-keriting',
 'Selada Keriting segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 9000, 'IKAT', '1 ikat ± 200g', 24,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/selada-keriting.jpg'),
 FALSE, 'Lembang, Jawa Barat', 'AKTIF', 15, 'c0000000-0000-4000-8000-000000000001'),

(UUID(), 'Daun Singkong', 'daun-singkong',
 'Daun Singkong segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 4500, 'IKAT', '1 ikat ± 300g', 30,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/daun-singkong.jpg'),
 FALSE, 'Sukabumi, Jawa Barat', 'AKTIF', 26, 'c0000000-0000-4000-8000-000000000001'),

-- -- Sayur Buah --
(UUID(), 'Tomat Merah', 'tomat-merah',
 'Tomat Merah segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 8000, 'KG', NULL, 40,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/tomat-merah.jpg'),
 FALSE, 'Garut, Jawa Barat', 'AKTIF', 55, 'c0000000-0000-4000-8000-000000000002'),

(UUID(), 'Terong Ungu', 'terong-ungu',
 'Terong Ungu segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 6000, 'KG', NULL, 33,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/terong-ungu.jpg'),
 FALSE, 'Cianjur, Jawa Barat', 'AKTIF', 19, 'c0000000-0000-4000-8000-000000000002'),

(UUID(), 'Timun', 'timun',
 'Timun segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 5000, 'KG', NULL, 45,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/timun.jpg'),
 FALSE, 'Sukabumi, Jawa Barat', 'AKTIF', 33, 'c0000000-0000-4000-8000-000000000002'),

(UUID(), 'Paprika Merah', 'paprika-merah',
 'Paprika Merah segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 25000, 'KG', NULL, 15,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/paprika-merah.jpg'),
 FALSE, 'Malang, Jawa Timur', 'AKTIF', 8, 'c0000000-0000-4000-8000-000000000002'),

(UUID(), 'Labu Siam', 'labu-siam',
 'Labu Siam segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 4000, 'KG', NULL, 38,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/labu-siam.jpg'),
 FALSE, 'Bogor, Jawa Barat', 'AKTIF', 22, 'c0000000-0000-4000-8000-000000000002'),

(UUID(), 'Buncis', 'buncis',
 'Buncis segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 7000, 'KG', NULL, 27,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/buncis.jpg'),
 FALSE, 'Lembang, Jawa Barat', 'AKTIF', 14, 'c0000000-0000-4000-8000-000000000002'),

(UUID(), 'Jagung Manis', 'jagung-manis',
 'Jagung Manis segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 3000, 'PCS', NULL, 60,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/jagung-manis.jpg'),
 FALSE, 'Malang, Jawa Timur', 'AKTIF', 71, 'c0000000-0000-4000-8000-000000000002'),

-- -- Umbi-umbian --
(UUID(), 'Kentang', 'kentang',
 'Kentang segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 10000, 'KG', NULL, 50,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/kentang.jpg'),
 FALSE, 'Dieng, Jawa Tengah', 'AKTIF', 46, 'c0000000-0000-4000-8000-000000000003'),

(UUID(), 'Wortel Organik', 'wortel-organik',
 'Wortel Organik segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 9000, 'KG', NULL, 30,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/wortel-organik.jpg'),
 TRUE, 'Lembang, Jawa Barat', 'AKTIF', 28, 'c0000000-0000-4000-8000-000000000003'),

(UUID(), 'Bawang Bombay', 'bawang-bombay',
 'Bawang Bombay segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 12000, 'KG', NULL, 25,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/bawang-bombay.jpg'),
 FALSE, 'Brebes, Jawa Tengah', 'AKTIF', 20, 'c0000000-0000-4000-8000-000000000003'),

(UUID(), 'Singkong', 'singkong',
 'Singkong segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 5000, 'KG', NULL, 40,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/singkong.jpg'),
 FALSE, 'Sukabumi, Jawa Barat', 'AKTIF', 31, 'c0000000-0000-4000-8000-000000000003'),

-- -- Bumbu Dapur --
(UUID(), 'Cabai Merah', 'cabai-merah',
 'Cabai Merah segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 12000, 'KG', NULL, 15,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/cabai-merah.jpg'),
 FALSE, 'Garut, Jawa Barat', 'AKTIF', 88, 'c0000000-0000-4000-8000-000000000004'),

(UUID(), 'Cabai Rawit', 'cabai-rawit',
 'Cabai Rawit segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 15000, 'KG', NULL, 18,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/cabai-rawit.jpg'),
 FALSE, 'Garut, Jawa Barat', 'AKTIF', 76, 'c0000000-0000-4000-8000-000000000004'),

(UUID(), 'Bawang Merah', 'bawang-merah',
 'Bawang Merah segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 14000, 'KG', NULL, 22,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/bawang-merah.jpg'),
 FALSE, 'Brebes, Jawa Tengah', 'AKTIF', 64, 'c0000000-0000-4000-8000-000000000004'),

(UUID(), 'Bawang Putih', 'bawang-putih',
 'Bawang Putih segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 16000, 'KG', NULL, 20,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/bawang-putih.jpg'),
 FALSE, 'Tegal, Jawa Tengah', 'AKTIF', 59, 'c0000000-0000-4000-8000-000000000004'),

(UUID(), 'Jahe', 'jahe',
 'Jahe segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 8000, 'GRAM', 'per 250g', 30,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/jahe.jpg'),
 FALSE, 'Wonosobo, Jawa Tengah', 'AKTIF', 25, 'c0000000-0000-4000-8000-000000000004'),

-- -- Buah --
(UUID(), 'Pisang Ambon', 'pisang-ambon',
 'Pisang Ambon segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 6000, 'KG', NULL, 35,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/pisang-ambon.jpg'),
 FALSE, 'Lampung', 'AKTIF', 41, 'c0000000-0000-4000-8000-000000000005'),

(UUID(), 'Pepaya', 'pepaya',
 'Pepaya segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 5000, 'KG', NULL, 20,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/pepaya.jpg'),
 FALSE, 'Bogor, Jawa Barat', 'AKTIF', 18, 'c0000000-0000-4000-8000-000000000005'),

(UUID(), 'Jeruk Lokal', 'jeruk-lokal',
 'Jeruk Lokal segar langsung dari petani lokal, dipetik dan dikirim di hari yang sama.',
 10000, 'KG', NULL, 28,
 JSON_ARRAY('https://res.cloudinary.com/demo/image/upload/sayur/jeruk-lokal.jpg'),
 FALSE, 'Garut, Jawa Barat', 'AKTIF', 37, 'c0000000-0000-4000-8000-000000000005')

ON DUPLICATE KEY UPDATE name = VALUES(name);
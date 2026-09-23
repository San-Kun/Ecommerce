import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { tryAdmin } from "@/lib/api-auth";
import { isCloudinaryConfigured, uploadImage, destroyImage } from "@/lib/cloudinary";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

// POST /api/upload - upload gambar produk (khusus admin).
// Body: multipart/form-data dengan field "file".
// Kalau Cloudinary dikonfigurasi -> upload ke Cloudinary.
// Kalau tidak -> simpan ke public/uploads dan kembalikan path lokal.
export async function POST(req: NextRequest) {
  const auth = await tryAdmin();
  if (auth.response) return auth.response;

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Format harus JPG, PNG, WEBP, atau GIF" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Ukuran gambar maksimal 5 MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Jalur Cloudinary (kalau dikonfigurasi)
  if (isCloudinaryConfigured()) {
    try {
      const url = await uploadImage(buffer);
      return NextResponse.json({ url }, { status: 201 });
    } catch (err) {
      console.error("Gagal upload ke Cloudinary:", err);
      return NextResponse.json({ error: "Gagal mengunggah gambar, coba lagi" }, { status: 502 });
    }
  }

  // Jalur lokal: simpan ke public/uploads dan kembalikan path yang bisa diakses browser.
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const ext = EXT[file.type] ?? "jpg";
    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch (err) {
    console.error("Gagal menyimpan gambar lokal:", err);
    return NextResponse.json({ error: "Gagal menyimpan gambar, coba lagi" }, { status: 500 });
  }
}

// DELETE /api/upload - hapus file gambar fisik (khusus admin).
// Body JSON: { url }. Menangani file lokal (/uploads/*) & asset Cloudinary.
// URL eksternal lain (picsum/unsplash/dll) diabaikan -- tidak ada yang bisa dihapus.
export async function DELETE(req: NextRequest) {
  const auth = await tryAdmin();
  if (auth.response) return auth.response;

  let url: unknown;
  try {
    ({ url } = await req.json());
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  if (typeof url !== "string" || !url) {
    return NextResponse.json({ error: "URL tidak valid" }, { status: 400 });
  }

  // File lokal di public/uploads
  if (url.startsWith("/uploads/")) {
    // Cegah path traversal: hanya izinkan nama file di dalam folder uploads.
    const filename = path.basename(url);
    const filePath = path.join(process.cwd(), "public", "uploads", filename);
    try {
      await unlink(filePath);
    } catch {
      // File mungkin sudah tidak ada -- anggap sukses (idempotent).
    }
    return NextResponse.json({ ok: true });
  }

  // Asset Cloudinary
  if (url.includes("res.cloudinary.com")) {
    try {
      await destroyImage(url);
    } catch (err) {
      console.error("Gagal hapus asset Cloudinary:", err);
      return NextResponse.json({ error: "Gagal menghapus gambar dari Cloudinary" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  }

  // URL eksternal lain: tidak ada file fisik milik kita untuk dihapus.
  return NextResponse.json({ ok: true, note: "URL eksternal, tidak ada file yang dihapus" });
}

import { NextRequest, NextResponse } from "next/server";
import { tryAdmin } from "@/lib/api-auth";
import { isCloudinaryConfigured, uploadImage } from "@/lib/cloudinary";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// POST /api/upload - upload gambar produk ke Cloudinary (khusus admin)
// Body: multipart/form-data dengan field "file".
export async function POST(req: NextRequest) {
  const auth = await tryAdmin();
  if (auth.response) return auth.response;

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary belum dikonfigurasi. Isi CLOUDINARY_* di .env, atau tempel URL gambar manual." },
      { status: 503 }
    );
  }

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

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImage(buffer);
    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    console.error("Gagal upload ke Cloudinary:", err);
    return NextResponse.json({ error: "Gagal mengunggah gambar, coba lagi" }, { status: 502 });
  }
}

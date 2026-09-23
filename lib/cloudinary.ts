import { v2 as cloudinary } from "cloudinary";

// Cloudinary dikonfigurasi lewat env. Kalau belum diisi, isConfigured() = false
// dan endpoint upload akan mengembalikan error yang jelas ke admin.
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudName && apiKey && apiSecret);
}

const UPLOAD_FOLDER = process.env.CLOUDINARY_FOLDER ?? "sayurku/products";

/** Upload buffer gambar ke Cloudinary, kembalikan secure URL. */
export function uploadImage(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: UPLOAD_FOLDER, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Upload gagal"));
          return;
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

/**
 * Ambil public_id dari sebuah URL Cloudinary. Contoh:
 * https://res.cloudinary.com/<cloud>/image/upload/v1699/sayurku/products/abc.jpg
 * -> "sayurku/products/abc"
 * Kembalikan null kalau URL bukan URL Cloudinary yang valid.
 */
export function cloudinaryPublicId(url: string): string | null {
  if (!url.includes("res.cloudinary.com")) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
  return match ? match[1] : null;
}

/** Hapus asset dari Cloudinary berdasarkan URL-nya. Aman dipanggil walau bukan URL Cloudinary. */
export async function destroyImage(url: string): Promise<void> {
  if (!isCloudinaryConfigured()) return;
  const publicId = cloudinaryPublicId(url);
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
}

export { cloudinary };

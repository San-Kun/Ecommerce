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

export { cloudinary };

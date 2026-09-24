import { z } from "zod";

export const paketMenuItemSchema = z.object({
  productId: z.string().uuid("Produk tidak valid"),
  quantity: z.coerce.number().int().min(1, "Kuantitas minimal 1"),
});

export const createPaketMenuSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter").max(150),
  slug: z
    .string()
    .min(3)
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung"),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().positive("Harga harus lebih dari 0"),
  // Terima URL lengkap ATAU path lokal hasil upload ("/uploads/..."), atau kosong
  image: z
    .string()
    .refine((s) => /^https?:\/\//.test(s) || s.startsWith("/"), "URL gambar tidak valid")
    .optional()
    .or(z.literal("")),
  items: z.array(paketMenuItemSchema).min(1, "Pilih minimal 1 produk"),
});

export const updatePaketMenuSchema = createPaketMenuSchema.partial();

export type CreatePaketMenuInput = z.infer<typeof createPaketMenuSchema>;
export type UpdatePaketMenuInput = z.infer<typeof updatePaketMenuSchema>;

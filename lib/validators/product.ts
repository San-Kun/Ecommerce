import { z } from "zod";

export const productUnitEnum = z.enum(["GRAM", "KG", "IKAT", "PCS"]);
export const productStatusEnum = z.enum(["AKTIF", "NONAKTIF", "HABIS"]);

export const createProductSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter").max(255),
  slug: z
    .string()
    .min(3)
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung"),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().positive("Harga harus lebih dari 0"),
  unit: productUnitEnum,
  weightPerUnit: z.string().max(50).optional(),
  stepQuantity: z.coerce.number().positive().default(1),
  minOrderQty: z.coerce.number().positive().default(1),
  stock: z.coerce.number().int().min(0).default(0),
  // Terima URL lengkap (http/https) ATAU path lokal hasil upload (mis. "/uploads/x.jpg")
  images: z
    .array(z.string().refine((s) => /^https?:\/\//.test(s) || s.startsWith("/"), "URL gambar tidak valid"))
    .optional(),
  isOrganic: z.boolean().default(false),
  origin: z.string().max(150).optional(),
  categoryId: z.string().uuid("Kategori tidak valid"),
});

export const updateProductSchema = createProductSchema.partial().extend({
  status: productStatusEnum.optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

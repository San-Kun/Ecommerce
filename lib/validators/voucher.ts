import { z } from "zod";

export const voucherTypeEnum = z.enum(["PERCENT", "FIXED"]);

export const createVoucherSchema = z.object({
  code: z
    .string()
    .min(3, "Kode minimal 3 karakter")
    .max(50)
    .regex(/^[A-Z0-9_-]+$/, "Kode hanya huruf besar, angka, - dan _")
    .transform((s) => s.toUpperCase()),
  description: z.string().max(255).optional(),
  type: voucherTypeEnum,
  value: z.coerce.number().positive("Nilai harus lebih dari 0"),
  minSpend: z.coerce.number().min(0).default(0),
  maxDiscount: z.coerce.number().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  expiresAt: z.string().datetime().optional().nullable().or(z.literal("")),
  usageLimit: z.coerce.number().int().positive().optional().nullable(),
});

export const updateVoucherSchema = createVoucherSchema.partial();

export const applyVoucherSchema = z.object({
  code: z.string().min(1, "Masukkan kode voucher").transform((s) => s.toUpperCase()),
  subtotal: z.coerce.number().min(0),
});

export type CreateVoucherInput = z.infer<typeof createVoucherSchema>;
export type UpdateVoucherInput = z.infer<typeof updateVoucherSchema>;

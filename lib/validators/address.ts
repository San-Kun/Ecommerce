import { z } from "zod";

export const createAddressSchema = z.object({
  label: z.string().min(1, "Label wajib diisi").max(100),
  fullAddress: z.string().min(5, "Alamat lengkap minimal 5 karakter"),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  isDefault: z.boolean().optional(),
});

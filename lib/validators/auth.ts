import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(255),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  phone: z.string().min(9).max(20).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const updateProfileSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter").max(255).optional(),
    phone: z.string().min(9).max(20).optional().or(z.literal("")),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter").optional(),
  })
  .refine((data) => !data.newPassword || !!data.currentPassword, {
    message: "Masukkan password lama untuk mengganti password",
    path: ["currentPassword"],
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

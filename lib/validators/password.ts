import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Token tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

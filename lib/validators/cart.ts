import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().uuid("Produk tidak valid"),
  quantity: z.coerce.number().positive("Kuantitas harus lebih dari 0"),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().positive("Kuantitas harus lebih dari 0"),
});

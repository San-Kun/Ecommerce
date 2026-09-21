import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z.string().uuid("Alamat tidak valid"),

  shippingSchedule: z
    .string()
    .min(1, "Pilih jadwal pengiriman"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "DIPROSES",
    "DIKIRIM",
    "SELESAI",
    "DIBATALKAN",
  ]),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export type UpdateOrderStatusInput = z.infer<
  typeof updateOrderStatusSchema
>;
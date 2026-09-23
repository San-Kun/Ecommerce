import { z } from "zod";

// Metode pembayaran yang didukung toko:
// - TRANSFER: transfer bank manual, dikonfirmasi admin setelah bukti masuk
// - COD: bayar tunai saat barang diantar
export const paymentMethodEnum = z.enum(["TRANSFER", "COD"]);

export const createOrderSchema = z.object({
  addressId: z.string().uuid("Alamat tidak valid"),

  shippingSchedule: z.string().min(1, "Pilih jadwal pengiriman"),

  paymentMethod: paymentMethodEnum,
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

export type PaymentMethod = z.infer<typeof paymentMethodEnum>;

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export type UpdateOrderStatusInput = z.infer<
  typeof updateOrderStatusSchema
>;

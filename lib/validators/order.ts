import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z.string().uuid("Alamat tidak valid"),
  shippingSchedule: z.string().min(1, "Pilih jadwal pengiriman"),
});

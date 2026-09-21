import { snap } from "./midtrans";

export type PaymentItemDetail = {
  id: string;
  price: number;
  quantity: number;
  name: string;
};

export type PaymentResult = {
  redirectUrl: string;
  token?: string;
};

// "mock" (default) -- simulasi internal, tidak butuh akun Midtrans aktif.
// "midtrans" -- pakai Snap API asli. Ganti PAYMENT_PROVIDER=midtrans di .env kalau
// akun sandbox Midtrans kamu sudah aktif dan mau pakai gateway sungguhan.
const PROVIDER = process.env.PAYMENT_PROVIDER ?? "mock";

export async function createPaymentTransaction(params: {
  orderNumber: string;
  grossAmount: number;
  user: { name: string; email?: string; phone?: string };
  itemDetails: PaymentItemDetail[];
}): Promise<PaymentResult> {
  if (PROVIDER === "midtrans") {
    const transaction = await snap.createTransaction({
      transaction_details: { order_id: params.orderNumber, gross_amount: params.grossAmount },
      user_details: {
        first_name: params.user.name,
        email: params.user.email,
        phone: params.user.phone,
      },
      item_details: params.itemDetails,
    });

    return { redirectUrl: transaction.redirect_url, token: transaction.token };
  }

  // Mode mock: arahkan ke halaman pembayaran simulasi kita sendiri, bukan Midtrans.
  return { redirectUrl: `/pembayaran/${params.orderNumber}` };
}

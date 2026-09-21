import { AddressForm } from "@/components/user/AddressForm";

export default function NewAddressPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-heading text-xl font-bold text-stone-900">Tambah Alamat</h1>
      <AddressForm mode="create" />
    </div>
  );
}

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { AddressForm } from "@/components/user/AddressForm";

export default async function EditAddressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=/profil/alamat/${id}`);

  const address = await prisma.address.findFirst({ where: { id, userId: user.sub } });
  if (!address) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-heading text-xl font-bold text-stone-900">Edit Alamat</h1>
      <AddressForm
        mode="edit"
        addressId={address.id}
        initialValues={{
          label: address.label,
          fullAddress: address.fullAddress,
          latitude: Number(address.latitude),
          longitude: Number(address.longitude),
          isDefault: address.isDefault,
        }}
      />
    </div>
  );
}

import { RegisterForm } from "@/components/user/RegisterForm";
import { LeafIcon } from "@/components/icons/LeafIcon";

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-xl border border-stone-200 bg-white p-6 sm:p-8">
        <LeafIcon className="h-8 w-8 text-emerald-600" />
        <h1 className="font-heading mt-3 text-2xl font-bold text-stone-900">Daftar akun SayurKu</h1>
        <p className="mt-1 text-sm text-stone-500">Gratis, langsung bisa belanja setelah daftar.</p>
        <RegisterForm />
      </div>
    </div>
  );
}

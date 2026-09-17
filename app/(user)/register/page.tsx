import { RegisterForm } from "@/components/user/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-semibold text-stone-900">Daftar akun SayurKu</h1>
      <p className="mt-1 text-sm text-stone-500">Gratis, langsung bisa belanja setelah daftar.</p>
      <RegisterForm />
    </div>
  );
}

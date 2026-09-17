import { LoginForm } from "@/components/user/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-semibold text-stone-900">Masuk ke SayurKu</h1>
      <p className="mt-1 text-sm text-stone-500">Belanja sayur segar langsung dari HP kamu.</p>
      <LoginForm redirectTo={redirect} />
    </div>
  );
}

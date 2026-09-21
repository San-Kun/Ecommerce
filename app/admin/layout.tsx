import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // proxy.ts sudah memblokir non-admin sebelum sampai sini; ini lapisan kedua
  // supaya layout tidak pernah render data admin kalau ada celah di proxy.
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-stone-50 lg:flex">
      <AdminSidebar userName={user.name} />
      <main className="flex-1 p-6 lg:p-10">{children}</main>
    </div>
  );
}

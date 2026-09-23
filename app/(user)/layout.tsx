import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/common/Toaster";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isLoggedIn={Boolean(user)} userName={user?.name} />

      {/* pb-20 di mobile supaya konten tidak tertutup BottomNav yang fixed */}
      <main className="flex-1 pb-20 sm:pb-0">{children}</main>

      <Footer />
      <BottomNav />
      <Toaster />
    </div>
  );
}

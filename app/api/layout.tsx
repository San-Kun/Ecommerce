// app/admin/layout.tsx
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-container">
      {/* Posisikan Sidebar / Navbar Admin di sini */}
      <aside>Sidebar Admin</aside>
      <main>{children}</main>
    </div>
  );
}
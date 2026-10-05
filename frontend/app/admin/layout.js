import AdminSidebar from "../../components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <AdminSidebar />

      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
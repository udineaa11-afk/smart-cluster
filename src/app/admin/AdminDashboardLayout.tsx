import { redirect } from "next/navigation";
import { getCurrentSuperAdmin } from "@/lib/super-admin-auth";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentSuperAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        {children}
      </main>
    </div>
  );
}

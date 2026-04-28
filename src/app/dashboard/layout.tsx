import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex" style={{ height: "calc(100vh - 4rem)" }}>
      <Sidebar userRole={user.role} />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">{children}</main>
    </div>
  );
}

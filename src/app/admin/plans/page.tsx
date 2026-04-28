import { getCurrentSuperAdmin } from "@/lib/super-admin-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminSidebar from "@/components/layout/AdminSidebar";
import PlansClient from "./PlansClient";

export default async function PlansPage() {
  const admin = await getCurrentSuperAdmin();
  if (!admin) redirect("/admin/login");

  const plans = await prisma.plan.findMany({
    include: { _count: { select: { subscriptions: true } } },
    orderBy: { price: "asc" },
  });

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <PlansClient initialPlans={plans} />
      </main>
    </div>
  );
}

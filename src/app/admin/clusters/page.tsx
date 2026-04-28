import { getCurrentSuperAdmin } from "@/lib/super-admin-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminSidebar from "@/components/layout/AdminSidebar";
import ClustersClient from "./ClustersClient";

export default async function ClustersPage() {
  const admin = await getCurrentSuperAdmin();
  if (!admin) redirect("/admin/login");

  const clusters = await prisma.cluster.findMany({
    include: {
      subscription: { include: { plan: true } },
      _count: {
        select: { users: true, news: true, mapBlocks: true, pets: true, gateEntries: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const plans = await prisma.plan.findMany({ orderBy: { price: "asc" } });

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
        <ClustersClient initialClusters={clusters} plans={plans} />
      </main>
    </div>
  );
}

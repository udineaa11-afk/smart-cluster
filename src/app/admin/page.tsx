import { getCurrentSuperAdmin } from "@/lib/super-admin-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Card from "@/components/ui/Card";
import { Building2, Users, Newspaper, CreditCard, TrendingUp, Package } from "lucide-react";

export default async function SuperAdminDashboard() {
  const admin = await getCurrentSuperAdmin();
  if (!admin) redirect("/admin/login");

  const [totalClusters, totalUsers, totalNews, plans, subscriptions] =
    await Promise.all([
      prisma.cluster.count(),
      prisma.user.count(),
      prisma.news.count(),
      prisma.plan.findMany({ include: { _count: { select: { subscriptions: true } } } }),
      prisma.subscription.findMany({
        where: { status: "active" },
        include: { plan: true, cluster: true },
      }),
    ]);

  const monthlyRevenue = subscriptions.reduce(
    (sum, s) => sum + (s.plan.price || 0),
    0
  );

  const recentClusters = await prisma.cluster.findMany({
    include: {
      subscription: { include: { plan: true } },
      _count: { select: { users: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const stats = [
    { label: "Total Klaster", value: totalClusters, icon: Building2, color: "text-blue-600 bg-blue-50" },
    { label: "Total Pengguna", value: totalUsers, icon: Users, color: "text-green-600 bg-green-50" },
    { label: "Total Berita", value: totalNews, icon: Newspaper, color: "text-indigo-600 bg-indigo-50" },
    { label: "Langganan Aktif", value: subscriptions.length, icon: CreditCard, color: "text-purple-600 bg-purple-50" },
    { label: "Pendapatan/Bulan", value: `Rp ${monthlyRevenue.toLocaleString("id-ID")}`, icon: TrendingUp, color: "text-yellow-600 bg-yellow-50" },
    { label: "Jumlah Paket", value: plans.length, icon: Package, color: "text-pink-600 bg-pink-50" },
  ];

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">
            Selamat datang, {admin.name}! Ringkasan platform Smart Cluster.
          </p>
        </div>

        <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900">
              Klaster Terbaru
            </h2>
            <div className="mt-4 space-y-3">
              {recentClusters.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada klaster</p>
              ) : (
                recentClusters.map((cluster) => (
                  <div
                    key={cluster.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {cluster.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {cluster._count.users} pengguna &bull;{" "}
                        {cluster.subscription?.plan.displayName || "Tanpa paket"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        cluster.subscription?.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {cluster.subscription?.status === "active"
                        ? "Aktif"
                        : "Nonaktif"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900">
              Distribusi Paket
            </h2>
            <div className="mt-4 space-y-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {plan.displayName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Rp {plan.price.toLocaleString("id-ID")}/bulan
                    </p>
                  </div>
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                    {plan._count.subscriptions} klaster
                  </span>
                </div>
              ))}
              {plans.length === 0 && (
                <p className="text-sm text-gray-500">
                  Belum ada paket. Buat paket di menu Paket Langganan.
                </p>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

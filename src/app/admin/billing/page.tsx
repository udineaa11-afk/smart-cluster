import { getCurrentSuperAdmin } from "@/lib/super-admin-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default async function BillingPage() {
  const admin = await getCurrentSuperAdmin();
  if (!admin) redirect("/admin/login");

  const subscriptions = await prisma.subscription.findMany({
    include: {
      cluster: true,
      plan: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalRevenue = subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + s.plan.price, 0);

  const statusLabel: Record<string, string> = {
    active: "Aktif",
    past_due: "Terlambat",
    canceled: "Dibatalkan",
    trial: "Percobaan",
  };

  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    past_due: "bg-red-100 text-red-800",
    canceled: "bg-gray-100 text-gray-600",
    trial: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
          <p className="text-sm text-gray-600">
            Ringkasan langganan dan pendapatan
          </p>
        </div>

        <div className="mb-8 grid gap-3 grid-cols-1 sm:grid-cols-3">
          <Card>
            <p className="text-sm text-gray-600">Pendapatan Bulanan</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Total Langganan</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {subscriptions.length}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Langganan Aktif</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {subscriptions.filter((s) => s.status === "active").length}
            </p>
          </Card>
        </div>

        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Daftar Langganan
          </h2>
          {subscriptions.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada langganan</p>
          ) : (
            <div className="overflow-x-auto">
              {/* Desktop table */}
              <table className="hidden sm:table w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 font-medium text-gray-500">Klaster</th>
                    <th className="pb-3 font-medium text-gray-500">Paket</th>
                    <th className="pb-3 font-medium text-gray-500">Harga</th>
                    <th className="pb-3 font-medium text-gray-500">Status</th>
                    <th className="pb-3 font-medium text-gray-500">Periode</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="py-3 font-medium text-gray-900">
                        {sub.cluster.name}
                      </td>
                      <td className="py-3 text-gray-600">
                        {sub.plan.displayName}
                      </td>
                      <td className="py-3 text-gray-600">
                        Rp {sub.plan.price.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3">
                        <Badge className={statusColor[sub.status] || ""}>
                          {statusLabel[sub.status] || sub.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-500">
                        {formatDate(sub.currentPeriodStart)} -{" "}
                        {formatDate(sub.currentPeriodEnd)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Mobile cards */}
              <div className="sm:hidden space-y-3">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="rounded-lg border border-gray-100 p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{sub.cluster.name}</span>
                      <Badge className={statusColor[sub.status] || ""}>
                        {statusLabel[sub.status] || sub.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{sub.plan.displayName} &bull; Rp {sub.plan.price.toLocaleString("id-ID")}</p>
                    <p className="text-xs text-gray-400">{formatDate(sub.currentPeriodStart)} - {formatDate(sub.currentPeriodEnd)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}

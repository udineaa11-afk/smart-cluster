import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Card from "@/components/ui/Card";
import { Newspaper, Map, Shield, Cat, Users, Flag } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const clusterId = user.clusterId;

  const [newsCount, blockCount, gateCount, catCount, userCount, flagCount] =
    await Promise.all([
      clusterId ? prisma.news.count({ where: { clusterId } }) : 0,
      clusterId ? prisma.mapBlock.count({ where: { clusterId } }) : 0,
      clusterId
        ? prisma.gateEntry.count({ where: { clusterId, status: "in" } })
        : 0,
      clusterId ? prisma.cat.count({ where: { clusterId } }) : 0,
      clusterId ? prisma.user.count({ where: { clusterId } }) : 0,
      clusterId
        ? prisma.featureFlag.count({ where: { clusterId, enabled: true } })
        : 0,
    ]);

  const stats = [
    { label: "Berita", value: newsCount, icon: Newspaper, color: "text-blue-600 bg-blue-50" },
    { label: "Blok Peta", value: blockCount, icon: Map, color: "text-green-600 bg-green-50" },
    { label: "Tamu Aktif", value: gateCount, icon: Shield, color: "text-yellow-600 bg-yellow-50" },
    { label: "Kucing", value: catCount, icon: Cat, color: "text-purple-600 bg-purple-50" },
    { label: "Warga", value: userCount, icon: Users, color: "text-indigo-600 bg-indigo-50" },
    { label: "Fitur Aktif", value: flagCount, icon: Flag, color: "text-pink-600 bg-pink-50" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600">
          Selamat datang, {user.name}! Peran anda:{" "}
          <span className="font-medium capitalize">{user.role}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {user.cluster && (
        <Card className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Info Klaster
          </h2>
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-medium">Nama:</span> {user.cluster.name}
            </p>
            {user.cluster.description && (
              <p>
                <span className="font-medium">Deskripsi:</span>{" "}
                {user.cluster.description}
              </p>
            )}
            {user.cluster.address && (
              <p>
                <span className="font-medium">Alamat:</span>{" "}
                {user.cluster.address}
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Card from "@/components/ui/Card";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isAdmin = ["admin", "rw_admin", "rt_admin"].includes(user.role);
  if (!isAdmin) {
    redirect("/dashboard");
  }

  const cluster = user.clusterId
    ? await prisma.cluster.findUnique({
        where: { id: user.clusterId },
        include: {
          rws: { include: { rts: true } },
          _count: { select: { users: true, news: true, mapBlocks: true } },
        },
      })
    : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-sm text-gray-600">
          Konfigurasi klaster dan hierarki RT/RW
        </p>
      </div>

      {cluster && (
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900">
              Informasi Klaster
            </h2>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Nama:</span>{" "}
                  <span className="font-medium">{cluster.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Total Warga:</span>{" "}
                  <span className="font-medium">{cluster._count.users}</span>
                </div>
                <div>
                  <span className="text-gray-500">Total Berita:</span>{" "}
                  <span className="font-medium">{cluster._count.news}</span>
                </div>
                <div>
                  <span className="text-gray-500">Total Blok:</span>{" "}
                  <span className="font-medium">
                    {cluster._count.mapBlocks}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900">
              Hierarki RT/RW
            </h2>
            {cluster.rws.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">
                Belum ada data RW/RT. Hubungi administrator untuk menambahkan
                hierarki.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {cluster.rws.map((rw) => (
                  <div
                    key={rw.id}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <h3 className="font-medium text-gray-900">RW {rw.number}</h3>
                    {rw.rts.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {rw.rts.map((rt) => (
                          <span
                            key={rt.id}
                            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                          >
                            RT {rt.number}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-gray-400">
                        Belum ada RT
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900">
              Multi-Tenant
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Smart Cluster mendukung multi-tenant. Setiap klaster memiliki data
              yang terpisah, termasuk warga, berita, peta, dan fitur. Feature
              flags dapat diaktifkan atau dinonaktifkan per klaster.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}

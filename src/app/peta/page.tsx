import { prisma } from "@/lib/db";
import PublicMapClient from "./PublicMapClient";

export default async function PetaPage() {
  const cluster = await prisma.cluster.findFirst();

  const blocks = cluster
    ? await prisma.mapBlock.findMany({ where: { clusterId: cluster.id } })
    : [];
  const pets = cluster
    ? await prisma.pet.findMany({ where: { clusterId: cluster.id } })
    : [];

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">Peta Klaster</h1>
        <p className="text-sm text-gray-600">
          Jelajahi area klaster, blok, dan lokasi hewan terdaftar
        </p>
      </div>
      <div className="flex-1">
        <PublicMapClient blocks={blocks} pets={pets} />
      </div>
    </div>
  );
}

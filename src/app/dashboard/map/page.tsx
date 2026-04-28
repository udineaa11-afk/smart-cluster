import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import MapBuilderClient from "./MapBuilderClient";

export default async function MapPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const blocks = user.clusterId
    ? await prisma.mapBlock.findMany({
        where: { clusterId: user.clusterId },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const pets = user.clusterId
    ? await prisma.pet.findMany({
        where: { clusterId: user.clusterId },
      })
    : [];

  const isAdmin = ["admin", "rw_admin", "rt_admin"].includes(user.role);

  return <MapBuilderClient initialBlocks={blocks} pets={pets} isAdmin={isAdmin} />;
}

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import CatsClient from "./CatsClient";

export default async function CatsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const cats = user.clusterId
    ? await prisma.cat.findMany({
        where: { clusterId: user.clusterId },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return <CatsClient initialCats={cats} />;
}

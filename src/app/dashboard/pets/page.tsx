import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PetsClient from "./PetsClient";

export default async function PetsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const pets = user.clusterId
    ? await prisma.pet.findMany({
        where: { clusterId: user.clusterId },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return <PetsClient initialPets={pets} />;
}

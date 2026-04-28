import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import GateClient from "./GateClient";

export default async function GatePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!["admin", "security"].includes(user.role)) {
    redirect("/dashboard");
  }

  const entries = user.clusterId
    ? await prisma.gateEntry.findMany({
        where: { clusterId: user.clusterId },
        include: { recordedByUser: { select: { name: true } } },
        orderBy: { entryTime: "desc" },
        take: 100,
      })
    : [];

  return <GateClient initialEntries={entries} />;
}

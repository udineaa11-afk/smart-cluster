import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import GateStandaloneClient from "./GateStandaloneClient";

export default async function GateStandalonePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin" && user.role !== "security") redirect("/dashboard");

  const entries = user.clusterId
    ? await prisma.gateEntry.findMany({
        where: { clusterId: user.clusterId },
        include: { recordedByUser: { select: { name: true } } },
        orderBy: { entryTime: "desc" },
        take: 50,
      })
    : [];

  return <GateStandaloneClient initialEntries={entries} />;
}

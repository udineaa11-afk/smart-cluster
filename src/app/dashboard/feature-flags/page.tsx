import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import FeatureFlagsClient from "./FeatureFlagsClient";

export default async function FeatureFlagsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }

  const flags = user.clusterId
    ? await prisma.featureFlag.findMany({
        where: { clusterId: user.clusterId },
        orderBy: { key: "asc" },
      })
    : [];

  return <FeatureFlagsClient initialFlags={flags} />;
}

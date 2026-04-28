import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const flags = await prisma.featureFlag.findMany({
      where: { clusterId: user.clusterId! },
      orderBy: { key: "asc" },
    });

    return NextResponse.json(flags);
  } catch (error) {
    console.error("FeatureFlags GET error:", error);
    return NextResponse.json(
      { error: "Gagal memuat feature flags" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, enabled } = body;

    const flag = await prisma.featureFlag.update({
      where: { id },
      data: { enabled },
    });

    return NextResponse.json(flag);
  } catch (error) {
    console.error("FeatureFlags PATCH error:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate feature flag" },
      { status: 500 }
    );
  }
}

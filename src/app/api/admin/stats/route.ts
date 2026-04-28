import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentSuperAdmin } from "@/lib/super-admin-auth";

export async function GET() {
  try {
    const admin = await getCurrentSuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalClusters,
      totalUsers,
      totalNews,
      activeSubscriptions,
      clusters,
    ] = await Promise.all([
      prisma.cluster.count(),
      prisma.user.count(),
      prisma.news.count(),
      prisma.subscription.count({ where: { status: "active" } }),
      prisma.cluster.findMany({
        include: {
          subscription: { include: { plan: true } },
          _count: {
            select: { users: true, news: true, mapBlocks: true, cats: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const revenue = clusters.reduce((sum, c) => {
      if (c.subscription?.status === "active") {
        return sum + (c.subscription.plan.price || 0);
      }
      return sum;
    }, 0);

    return NextResponse.json({
      totalClusters,
      totalUsers,
      totalNews,
      activeSubscriptions,
      monthlyRevenue: revenue,
      clusters,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Gagal memuat statistik" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentSuperAdmin } from "@/lib/super-admin-auth";
import { hashPassword } from "@/lib/auth";
import { DEFAULT_FEATURES } from "@/lib/feature-flags";

export async function GET() {
  try {
    const admin = await getCurrentSuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clusters = await prisma.cluster.findMany({
      include: {
        subscription: { include: { plan: true } },
        _count: {
          select: { users: true, news: true, mapBlocks: true, cats: true, gateEntries: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(clusters);
  } catch (error) {
    console.error("Admin clusters GET error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data klaster" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentSuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, address, adminName, adminEmail, adminPassword, planId } = body;

    if (!name || !adminName || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: "Data klaster dan admin wajib diisi" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email admin sudah terdaftar" },
        { status: 400 }
      );
    }

    const plan = planId
      ? await prisma.plan.findUnique({ where: { id: planId } })
      : await prisma.plan.findUnique({ where: { name: "free" } });

    const cluster = await prisma.cluster.create({
      data: {
        name,
        description,
        address,
        featureFlags: {
          create: DEFAULT_FEATURES.map((f) => ({
            key: f.key,
            label: f.label,
            enabled: true,
          })),
        },
      },
    });

    const passwordHash = await hashPassword(adminPassword);
    await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: "admin",
        clusterId: cluster.id,
      },
    });

    if (plan) {
      await prisma.subscription.create({
        data: {
          clusterId: cluster.id,
          planId: plan.id,
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    return NextResponse.json(cluster, { status: 201 });
  } catch (error) {
    console.error("Admin clusters POST error:", error);
    return NextResponse.json(
      { error: "Gagal membuat klaster" },
      { status: 500 }
    );
  }
}

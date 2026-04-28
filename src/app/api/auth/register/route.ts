import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { DEFAULT_FEATURES } from "@/lib/feature-flags";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, clusterName } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nama, email, dan password wajib diisi" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    let cluster = await prisma.cluster.findFirst();
    if (!cluster) {
      cluster = await prisma.cluster.create({
        data: {
          name: clusterName || "Smart Cluster",
          description: "Klaster pertama",
          featureFlags: {
            create: DEFAULT_FEATURES.map((f) => ({
              key: f.key,
              label: f.label,
              enabled: true,
            })),
          },
        },
      });
    }

    const userCount = await prisma.user.count();
    const role = userCount === 0 ? "admin" : "warga";

    const user = await prisma.user.create({
      data: { name, email, passwordHash, role, clusterId: cluster.id },
    });

    await createSession(user.id);

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

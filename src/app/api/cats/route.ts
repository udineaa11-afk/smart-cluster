import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const cluster = await prisma.cluster.findFirst();
    if (!cluster) {
      return NextResponse.json([]);
    }

    const cats = await prisma.cat.findMany({
      where: { clusterId: cluster.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(cats);
  } catch (error) {
    console.error("Cats GET error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data kucing" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, color, latitude, longitude, status } = body;

    if (!name || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Nama dan lokasi wajib diisi" },
        { status: 400 }
      );
    }

    const cat = await prisma.cat.create({
      data: {
        name,
        description,
        color,
        latitude,
        longitude,
        status: status || "stray",
        clusterId: user.clusterId!,
      },
    });

    return NextResponse.json(cat, { status: 201 });
  } catch (error) {
    console.error("Cats POST error:", error);
    return NextResponse.json(
      { error: "Gagal mendaftarkan kucing" },
      { status: 500 }
    );
  }
}

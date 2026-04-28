import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !["admin", "security"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");

    const where: Record<string, unknown> = { clusterId: user.clusterId! };
    if (status) {
      where.status = status;
    }

    const entries = await prisma.gateEntry.findMany({
      where,
      include: { recordedByUser: { select: { name: true } } },
      orderBy: { entryTime: "desc" },
      take: 100,
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Gate GET error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data gerbang" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !["admin", "security"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { visitorName, purpose, vehiclePlate } = body;

    if (!visitorName || !purpose) {
      return NextResponse.json(
        { error: "Nama pengunjung dan tujuan wajib diisi" },
        { status: 400 }
      );
    }

    const entry = await prisma.gateEntry.create({
      data: {
        visitorName,
        purpose,
        vehiclePlate,
        clusterId: user.clusterId!,
        recordedBy: user.id,
      },
      include: { recordedByUser: { select: { name: true } } },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Gate POST error:", error);
    return NextResponse.json(
      { error: "Gagal mencatat pengunjung" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !["admin", "security"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    const entry = await prisma.gateEntry.update({
      where: { id },
      data: { status: "out", exitTime: new Date() },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Gate PATCH error:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate data" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const cluster = await prisma.cluster.findFirst();
    if (!cluster) {
      return NextResponse.json([]);
    }

    const blocks = await prisma.mapBlock.findMany({
      where: { clusterId: cluster.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(blocks);
  } catch (error) {
    console.error("MapBlocks GET error:", error);
    return NextResponse.json(
      { error: "Gagal memuat blok peta" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !["admin", "rw_admin", "rt_admin"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, polygon, color, blockType } = body;

    if (!name || !polygon) {
      return NextResponse.json(
        { error: "Nama dan polygon wajib diisi" },
        { status: 400 }
      );
    }

    const block = await prisma.mapBlock.create({
      data: {
        name,
        description,
        polygon: typeof polygon === "string" ? polygon : JSON.stringify(polygon),
        color: color || "#3B82F6",
        blockType: blockType || "area",
        clusterId: user.clusterId!,
      },
    });

    return NextResponse.json(block, { status: 201 });
  } catch (error) {
    console.error("MapBlocks POST error:", error);
    return NextResponse.json(
      { error: "Gagal membuat blok peta" },
      { status: 500 }
    );
  }
}

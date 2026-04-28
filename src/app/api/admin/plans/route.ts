import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentSuperAdmin } from "@/lib/super-admin-auth";

export async function GET() {
  try {
    const admin = await getCurrentSuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plans = await prisma.plan.findMany({
      include: { _count: { select: { subscriptions: true } } },
      orderBy: { price: "asc" },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Admin plans GET error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data paket" },
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
    const { name, displayName, price, maxUsers, maxNews, maxMapBlocks, maxCats, features } = body;

    if (!name || !displayName) {
      return NextResponse.json(
        { error: "Nama paket wajib diisi" },
        { status: 400 }
      );
    }

    const plan = await prisma.plan.create({
      data: {
        name,
        displayName,
        price: price || 0,
        maxUsers: maxUsers || 50,
        maxNews: maxNews || 100,
        maxMapBlocks: maxMapBlocks || 20,
        maxCats: maxCats || 50,
        features: typeof features === "string" ? features : JSON.stringify(features || []),
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("Admin plans POST error:", error);
    return NextResponse.json(
      { error: "Gagal membuat paket" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getCurrentSuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (data.features && typeof data.features !== "string") {
      data.features = JSON.stringify(data.features);
    }

    const plan = await prisma.plan.update({
      where: { id },
      data,
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Admin plans PATCH error:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate paket" },
      { status: 500 }
    );
  }
}

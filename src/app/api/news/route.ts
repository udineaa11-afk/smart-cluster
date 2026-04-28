import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const publicOnly = searchParams.get("public") === "true";
    const category = searchParams.get("category");

    const user = await getCurrentUser();

    const where: Record<string, unknown> = {};
    if (publicOnly || !user) {
      where.isPublic = true;
    }
    if (category) {
      where.category = category;
    }
    if (user?.clusterId) {
      where.clusterId = user.clusterId;
    }

    const news = await prisma.news.findMany({
      where,
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error("News GET error:", error);
    return NextResponse.json(
      { error: "Gagal memuat berita" },
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
    const { title, content, isPublic, category } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Judul dan konten wajib diisi" },
        { status: 400 }
      );
    }

    const news = await prisma.news.create({
      data: {
        title,
        content,
        isPublic: isPublic ?? true,
        category: category || "general",
        clusterId: user.clusterId!,
        authorId: user.id,
      },
      include: { author: { select: { name: true } } },
    });

    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    console.error("News POST error:", error);
    return NextResponse.json(
      { error: "Gagal membuat berita" },
      { status: 500 }
    );
  }
}

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NewsClient from "./NewsClient";

export default async function NewsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const news = user.clusterId
    ? await prisma.news.findMany({
        where: { clusterId: user.clusterId },
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const isAdmin = ["admin", "rw_admin", "rt_admin"].includes(user.role);

  return <NewsClient initialNews={news} isAdmin={isAdmin} />;
}

import Link from "next/link";
import { prisma } from "@/lib/db";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatDate, getCategoryLabel, getCategoryColor } from "@/lib/utils";
import {
  Newspaper,
  Map,
  Shield,
  Cat,
  Users,
  ArrowRight,
} from "lucide-react";

export default async function HomePage() {
  const news = await prisma.news.findMany({
    where: { isPublic: true },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Smart Cluster
            </h1>
            <p className="mt-4 text-lg text-blue-100">
              Platform manajemen klaster perumahan cerdas untuk komunitas RT/RW
              di Indonesia. Kelola berita, peta, keamanan, dan lebih banyak lagi
              dalam satu tempat.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/peta"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50 transition-colors"
              >
                <Map className="h-4 w-4" />
                Lihat Peta
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-blue-300 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Masuk sebagai Warga
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900">Fitur Unggulan</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Newspaper,
              title: "Berita & Pengumuman",
              desc: "Informasi terbaru untuk seluruh warga klaster",
            },
            {
              icon: Map,
              title: "Peta Interaktif",
              desc: "Peta klaster dengan blok dan area custom",
            },
            {
              icon: Shield,
              title: "Keamanan Gerbang",
              desc: "Pencatatan pengunjung dan akses gerbang digital",
            },
            {
              icon: Cat,
              title: "Registrasi Kucing",
              desc: "Peta kucing terdaftar di lingkungan klaster",
            },
          ].map((feature) => (
            <Card key={feature.title}>
              <feature.icon className="h-8 w-8 text-blue-600" />
              <h3 className="mt-4 font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Public News */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Berita Terkini</h2>
          <Link
            href="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Masuk untuk lihat semua &rarr;
          </Link>
        </div>

        {news.length === 0 ? (
          <Card className="mt-8 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">
              Belum ada berita. Silakan daftar untuk mulai mengelola klaster.
            </p>
            <Link
              href="/register"
              className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Daftar Sekarang &rarr;
            </Link>
          </Card>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <Card key={item.id}>
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryColor(item.category)}>
                    {getCategoryLabel(item.category)}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                <h3 className="mt-3 font-semibold text-gray-900 line-clamp-2">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                  {item.content}
                </p>
                <p className="mt-3 text-xs text-gray-400">
                  Oleh {item.author.name}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

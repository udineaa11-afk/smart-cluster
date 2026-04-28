import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import * as bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({ url: "file:dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create subscription plans
  const freePlan = await prisma.plan.create({
    data: {
      name: "free",
      displayName: "Gratis",
      price: 0,
      maxUsers: 20,
      maxNews: 30,
      maxMapBlocks: 5,
      maxCats: 10,
      features: JSON.stringify(["news_wall", "map_builder"]),
    },
  });

  const basicPlan = await prisma.plan.create({
    data: {
      name: "basic",
      displayName: "Paket Dasar",
      price: 150000,
      maxUsers: 100,
      maxNews: 200,
      maxMapBlocks: 30,
      maxCats: 50,
      features: JSON.stringify([
        "news_wall",
        "map_builder",
        "gate_security",
        "cat_registry",
      ]),
    },
  });

  await prisma.plan.create({
    data: {
      name: "premium",
      displayName: "Paket Premium",
      price: 350000,
      maxUsers: 500,
      maxNews: 1000,
      maxMapBlocks: 100,
      maxCats: 200,
      features: JSON.stringify([
        "news_wall",
        "map_builder",
        "gate_security",
        "cat_registry",
        "resident_directory",
        "facility_booking",
        "dues_tracker",
        "event_calendar",
      ]),
    },
  });

  await prisma.plan.create({
    data: {
      name: "enterprise",
      displayName: "Enterprise",
      price: 750000,
      maxUsers: 9999,
      maxNews: 9999,
      maxMapBlocks: 9999,
      maxCats: 9999,
      features: JSON.stringify([
        "news_wall",
        "map_builder",
        "gate_security",
        "cat_registry",
        "resident_directory",
        "facility_booking",
        "dues_tracker",
        "event_calendar",
      ]),
    },
  });

  // Create super admin (app owner)
  const superAdminHash = await bcrypt.hash("super123", 12);
  await prisma.superAdmin.create({
    data: {
      name: "App Owner",
      email: "super@smartcluster.id",
      passwordHash: superAdminHash,
    },
  });

  // Create cluster
  const cluster = await prisma.cluster.create({
    data: {
      name: "Klaster Harmoni Sejahtera",
      description: "Perumahan klaster modern di Jakarta Selatan",
      address: "Jl. Raya Harmoni No. 1, Jakarta Selatan",
    },
  });

  // Create subscription for the cluster
  await prisma.subscription.create({
    data: {
      clusterId: cluster.id,
      planId: basicPlan.id,
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Create a second cluster with free plan
  const cluster2 = await prisma.cluster.create({
    data: {
      name: "Griya Asri Residence",
      description: "Perumahan keluarga di Tangerang",
      address: "Jl. Griya Asri Blok A, Tangerang",
    },
  });

  await prisma.subscription.create({
    data: {
      clusterId: cluster2.id,
      planId: freePlan.id,
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Create RW and RT hierarchy
  const rw1 = await prisma.rW.create({
    data: { number: "001", clusterId: cluster.id },
  });
  const rw2 = await prisma.rW.create({
    data: { number: "002", clusterId: cluster.id },
  });

  const rt1 = await prisma.rT.create({
    data: { number: "001", rwId: rw1.id },
  });
  const rt2 = await prisma.rT.create({
    data: { number: "002", rwId: rw1.id },
  });
  await prisma.rT.create({
    data: { number: "001", rwId: rw2.id },
  });

  // Create feature flags for cluster 1
  const features = [
    { key: "news_wall", label: "Berita & Pengumuman", enabled: true },
    { key: "map_builder", label: "Peta & Blok", enabled: true },
    { key: "gate_security", label: "Keamanan Gerbang", enabled: true },
    { key: "cat_registry", label: "Registrasi Kucing", enabled: true },
    { key: "resident_directory", label: "Direktori Warga", enabled: false },
    { key: "facility_booking", label: "Booking Fasilitas", enabled: false },
    { key: "dues_tracker", label: "Iuran Warga", enabled: false },
    { key: "event_calendar", label: "Kalender Acara", enabled: false },
  ];

  for (const flag of features) {
    await prisma.featureFlag.create({
      data: { ...flag, clusterId: cluster.id },
    });
  }

  // Feature flags for cluster 2
  for (const flag of features.slice(0, 2)) {
    await prisma.featureFlag.create({
      data: { ...flag, clusterId: cluster2.id },
    });
  }

  // Create users
  const adminHash = await bcrypt.hash("admin123", 12);
  const wargaHash = await bcrypt.hash("warga123", 12);
  const securityHash = await bcrypt.hash("security123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Pak Ahmad (Admin)",
      email: "admin@smartcluster.id",
      passwordHash: adminHash,
      role: "admin",
      phone: "08123456789",
      clusterId: cluster.id,
      rwId: rw1.id,
      rtId: rt1.id,
    },
  });

  const warga = await prisma.user.create({
    data: {
      name: "Bu Siti",
      email: "siti@smartcluster.id",
      passwordHash: wargaHash,
      role: "warga",
      phone: "08198765432",
      clusterId: cluster.id,
      rwId: rw1.id,
      rtId: rt2.id,
    },
  });

  await prisma.user.create({
    data: {
      name: "Pak Budi (Satpam)",
      email: "security@smartcluster.id",
      passwordHash: securityHash,
      role: "security",
      phone: "08111222333",
      clusterId: cluster.id,
    },
  });

  // Admin for cluster 2
  await prisma.user.create({
    data: {
      name: "Ibu Ratna (Admin)",
      email: "ratna@griyaasri.id",
      passwordHash: adminHash,
      role: "admin",
      clusterId: cluster2.id,
    },
  });

  // Create news
  const newsItems = [
    {
      title: "Jadwal Gotong Royong Minggu Ini",
      content:
        "Warga yang terhormat, gotong royong akan diadakan pada hari Minggu, 4 Mei 2026 pukul 07:00 WIB. Dimohon partisipasi seluruh warga untuk menjaga kebersihan lingkungan klaster kita. Peralatan kebersihan akan disediakan di pos satpam.",
      isPublic: true,
      category: "event",
    },
    {
      title: "Iuran Bulanan April 2026",
      content:
        "Pengumuman: Iuran bulanan untuk bulan April 2026 sebesar Rp 350.000 sudah dapat dibayarkan. Pembayaran dapat dilakukan melalui transfer ke rekening BCA 1234567890 a.n. Klaster Harmoni Sejahtera atau langsung ke Pak Ahmad (RT 001/RW 001).",
      isPublic: false,
      category: "announcement",
    },
    {
      title: "Perbaikan Jalan Blok C",
      content:
        "Informasi: Jalan di Blok C sedang dalam perbaikan. Mohon untuk menggunakan jalur alternatif melalui Blok B selama proses pengerjaan berlangsung. Estimasi selesai dalam 5 hari kerja.",
      isPublic: true,
      category: "general",
    },
    {
      title: "PERINGATAN: Waspada Pencurian",
      content:
        "Dihimbau kepada seluruh warga untuk meningkatkan kewaspadaan. Telah terjadi percobaan pencurian di area sekitar klaster. Pastikan pintu dan jendela terkunci dengan baik. Laporkan aktivitas mencurigakan ke pos satpam atau hubungi 08111222333.",
      isPublic: true,
      category: "emergency",
    },
  ];

  for (const item of newsItems) {
    await prisma.news.create({
      data: {
        ...item,
        clusterId: cluster.id,
        authorId: admin.id,
      },
    });
  }

  // Create map blocks
  const blocks = [
    {
      name: "Blok A",
      description: "Area perumahan Blok A (20 unit)",
      polygon: JSON.stringify([
        [-6.208, 106.845],
        [-6.208, 106.847],
        [-6.21, 106.847],
        [-6.21, 106.845],
      ]),
      color: "#3B82F6",
      blockType: "area",
    },
    {
      name: "Blok B",
      description: "Area perumahan Blok B (15 unit)",
      polygon: JSON.stringify([
        [-6.206, 106.845],
        [-6.206, 106.847],
        [-6.208, 106.847],
        [-6.208, 106.845],
      ]),
      color: "#10B981",
      blockType: "area",
    },
    {
      name: "Taman Harmoni",
      description: "Taman bermain dan area hijau",
      polygon: JSON.stringify([
        [-6.207, 106.847],
        [-6.207, 106.848],
        [-6.208, 106.848],
        [-6.208, 106.847],
      ]),
      color: "#22C55E",
      blockType: "park",
    },
    {
      name: "Gerbang Utama",
      description: "Pos keamanan dan gerbang masuk utama",
      polygon: JSON.stringify([
        [-6.2095, 106.846],
        [-6.2095, 106.8465],
        [-6.21, 106.8465],
        [-6.21, 106.846],
      ]),
      color: "#EF4444",
      blockType: "gate",
    },
  ];

  for (const block of blocks) {
    await prisma.mapBlock.create({
      data: { ...block, clusterId: cluster.id },
    });
  }

  // Create gate entries
  await prisma.gateEntry.create({
    data: {
      visitorName: "Pak Delivery GoFood",
      purpose: "Antar makanan ke Blok A No. 5",
      vehiclePlate: "B 1234 XYZ",
      clusterId: cluster.id,
      recordedBy: warga.id,
    },
  });

  // Create cats
  const cats = [
    {
      name: "Si Oyen",
      description: "Kucing oranye ramah, sering di taman",
      color: "Oranye",
      latitude: -6.207,
      longitude: 106.8475,
      status: "stray",
    },
    {
      name: "Hitam",
      description: "Kucing hitam, peliharaan Blok A No. 3",
      color: "Hitam",
      latitude: -6.209,
      longitude: 106.846,
      status: "owned",
    },
    {
      name: "Belang",
      description: "Kucing belang tiga, koloni dekat pos satpam",
      color: "Belang tiga",
      latitude: -6.2098,
      longitude: 106.8462,
      status: "colony",
    },
  ];

  for (const cat of cats) {
    await prisma.cat.create({
      data: { ...cat, clusterId: cluster.id },
    });
  }

  console.log("Seed data created successfully!");
  console.log("\nTest accounts:");
  console.log("  Super Admin: super@smartcluster.id / super123");
  console.log("  Admin:       admin@smartcluster.id / admin123");
  console.log("  Warga:       siti@smartcluster.id / warga123");
  console.log("  Security:    security@smartcluster.id / security123");
  console.log("\nSuper Admin panel: /admin/login");
  console.log("Cluster dashboard: /login");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

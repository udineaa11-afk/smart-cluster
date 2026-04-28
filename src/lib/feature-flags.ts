import { prisma } from "./db";

export async function isFeatureEnabled(
  clusterId: string,
  featureKey: string
): Promise<boolean> {
  const flag = await prisma.featureFlag.findUnique({
    where: { clusterId_key: { clusterId, key: featureKey } },
  });
  return flag?.enabled ?? false;
}

export async function getFeatureFlags(clusterId: string) {
  return prisma.featureFlag.findMany({
    where: { clusterId },
    orderBy: { key: "asc" },
  });
}

export const DEFAULT_FEATURES = [
  { key: "news_wall", label: "Berita & Pengumuman" },
  { key: "map_builder", label: "Peta & Blok" },
  { key: "gate_security", label: "Keamanan Gerbang" },
  { key: "pet_registry", label: "Registrasi Hewan" },
  { key: "resident_directory", label: "Direktori Warga" },
  { key: "facility_booking", label: "Booking Fasilitas" },
  { key: "dues_tracker", label: "Iuran Warga" },
  { key: "event_calendar", label: "Kalender Acara" },
] as const;

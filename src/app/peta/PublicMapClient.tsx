"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-100">
      <p className="text-gray-500">Memuat peta...</p>
    </div>
  ),
});

interface MapBlock {
  id: string;
  name: string;
  description: string | null;
  polygon: string;
  color: string;
  blockType: string;
}

interface CatData {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  status: string;
  color: string | null;
}

interface PublicMapClientProps {
  blocks: MapBlock[];
  cats: CatData[];
}

export default function PublicMapClient({ blocks, cats }: PublicMapClientProps) {
  return <MapView blocks={blocks} cats={cats} />;
}

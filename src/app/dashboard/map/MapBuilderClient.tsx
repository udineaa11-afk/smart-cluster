"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { Plus, X, Trash2 } from "lucide-react";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 items-center justify-center bg-gray-100 rounded-lg">
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

interface MapBuilderClientProps {
  initialBlocks: MapBlock[];
  cats: CatData[];
  isAdmin: boolean;
}

export default function MapBuilderClient({
  initialBlocks,
  cats,
  isAdmin,
}: MapBuilderClientProps) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [drawMode, setDrawMode] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [blockType, setBlockType] = useState("area");
  const [loading, setLoading] = useState(false);

  function handlePointAdd(lat: number, lng: number) {
    setDrawnPoints((prev) => [...prev, [lat, lng]]);
  }

  async function handleSaveBlock() {
    if (drawnPoints.length < 3 || !name) return;
    setLoading(true);

    try {
      const res = await fetch("/api/map-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          polygon: JSON.stringify(drawnPoints),
          color,
          blockType,
        }),
      });

      if (res.ok) {
        const newBlock = await res.json();
        setBlocks([newBlock, ...blocks]);
        resetForm();
      }
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setDrawMode(false);
    setDrawnPoints([]);
    setName("");
    setDescription("");
    setColor("#3B82F6");
    setBlockType("area");
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Peta Builder</h1>
          <p className="text-sm text-gray-600">
            Kelola blok dan area pada peta klaster
          </p>
        </div>
        {isAdmin && !drawMode && (
          <Button onClick={() => setDrawMode(true)}>
            <Plus className="mr-1 h-4 w-4" /> Tambah Blok
          </Button>
        )}
      </div>

      {drawMode && (
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Gambar Blok Baru</h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mb-4 text-sm text-gray-600">
            Klik pada peta untuk menambahkan titik polygon. Minimal 3 titik.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="block-name"
              label="Nama Blok"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Blok A"
            />
            <Input
              id="block-desc"
              label="Deskripsi"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Keterangan blok"
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Tipe
              </label>
              <select
                value={blockType}
                onChange={(e) => setBlockType(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-full"
              >
                <option value="area">Area</option>
                <option value="facility">Fasilitas</option>
                <option value="park">Taman</option>
                <option value="parking">Parkir</option>
                <option value="gate">Gerbang</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Warna
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-full rounded-lg border border-gray-300"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Titik: {drawnPoints.length}
            </span>
            {drawnPoints.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDrawnPoints([])}
              >
                <Trash2 className="mr-1 h-3 w-3" /> Reset Titik
              </Button>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              onClick={handleSaveBlock}
              disabled={drawnPoints.length < 3 || !name || loading}
            >
              {loading ? "Menyimpan..." : "Simpan Blok"}
            </Button>
            <Button variant="secondary" onClick={resetForm}>
              Batal
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card padding={false} className="overflow-hidden">
            <div style={{ height: "500px" }}>
              <MapView
                blocks={blocks}
                cats={cats}
                drawMode={drawMode}
                drawnPoints={drawnPoints}
                onPointAdd={drawMode ? handlePointAdd : undefined}
              />
            </div>
          </Card>
        </div>
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">
            Blok ({blocks.length})
          </h3>
          {blocks.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada blok</p>
          ) : (
            blocks.map((block) => (
              <Card key={block.id} className="!p-4">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: block.color }}
                  />
                  <span className="font-medium text-sm">{block.name}</span>
                  <span className="text-xs text-gray-400 capitalize">
                    {block.blockType}
                  </span>
                </div>
                {block.description && (
                  <p className="mt-1 text-xs text-gray-500">
                    {block.description}
                  </p>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

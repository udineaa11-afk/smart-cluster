"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { Plus, X } from "lucide-react";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 items-center justify-center bg-gray-100 rounded-lg">
      <p className="text-gray-500">Memuat peta...</p>
    </div>
  ),
});

interface CatData {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  latitude: number;
  longitude: number;
  status: string;
}

interface CatsClientProps {
  initialCats: CatData[];
}

export default function CatsClient({ initialCats }: CatsClientProps) {
  const [cats, setCats] = useState(initialCats);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("");
  const [status, setStatus] = useState("stray");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  function handleMapClick(latitude: number, longitude: number) {
    if (showForm) {
      setLat(latitude);
      setLng(longitude);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lat === null || lng === null) return;
    setLoading(true);

    try {
      const res = await fetch("/api/cats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || undefined,
          color: color || undefined,
          latitude: lat,
          longitude: lng,
          status,
        }),
      });

      if (res.ok) {
        const newCat = await res.json();
        setCats([newCat, ...cats]);
        setName("");
        setDescription("");
        setColor("");
        setStatus("stray");
        setLat(null);
        setLng(null);
        setShowForm(false);
      }
    } finally {
      setLoading(false);
    }
  }

  const statusLabel: Record<string, string> = {
    stray: "Liar",
    owned: "Peliharaan",
    colony: "Koloni",
  };

  const statusColor: Record<string, string> = {
    stray: "bg-gray-100 text-gray-800",
    owned: "bg-green-100 text-green-800",
    colony: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registrasi Kucing</h1>
          <p className="text-sm text-gray-600">
            Peta dan daftar kucing terdaftar di klaster. Total: {cats.length}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <>
              <X className="mr-1 h-4 w-4" /> Batal
            </>
          ) : (
            <>
              <Plus className="mr-1 h-4 w-4" /> Tambah Kucing
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <h2 className="mb-2 text-lg font-semibold">Daftarkan Kucing</h2>
          <p className="mb-4 text-sm text-gray-600">
            Klik pada peta untuk menandai lokasi kucing
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="cat-name"
                label="Nama Kucing"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Si Oyen"
                required
              />
              <Input
                id="cat-color"
                label="Warna Bulu"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Contoh: Oranye"
              />
              <Input
                id="cat-desc"
                label="Deskripsi"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ciri-ciri kucing"
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="stray">Liar</option>
                  <option value="owned">Peliharaan</option>
                  <option value="colony">Koloni</option>
                </select>
              </div>
            </div>
            {lat !== null && lng !== null ? (
              <p className="text-sm text-green-600">
                Lokasi dipilih: {lat.toFixed(6)}, {lng.toFixed(6)}
              </p>
            ) : (
              <p className="text-sm text-yellow-600">
                Klik peta di bawah untuk memilih lokasi
              </p>
            )}
            <Button
              type="submit"
              disabled={loading || lat === null || lng === null || !name}
            >
              {loading ? "Menyimpan..." : "Simpan Kucing"}
            </Button>
          </form>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card padding={false} className="overflow-hidden">
            <div style={{ height: "400px" }}>
              <MapView
                cats={cats}
                onMapClick={showForm ? handleMapClick : undefined}
              />
            </div>
          </Card>
        </div>
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">
            Daftar Kucing ({cats.length})
          </h3>
          {cats.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada kucing terdaftar</p>
          ) : (
            cats.map((cat) => (
              <Card key={cat.id} className="!p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🐱</span>
                      <span className="font-medium text-sm">{cat.name}</span>
                      <Badge className={statusColor[cat.status] || ""}>
                        {statusLabel[cat.status] || cat.status}
                      </Badge>
                    </div>
                    {cat.color && (
                      <p className="mt-1 text-xs text-gray-500">
                        Warna: {cat.color}
                      </p>
                    )}
                    {cat.description && (
                      <p className="text-xs text-gray-500">{cat.description}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

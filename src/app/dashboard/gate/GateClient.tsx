"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import { Plus, X, LogOut } from "lucide-react";

interface GateEntryData {
  id: string;
  visitorName: string;
  purpose: string;
  vehiclePlate: string | null;
  entryTime: Date;
  exitTime: Date | null;
  status: string;
  recordedByUser: { name: string };
}

interface GateClientProps {
  initialEntries: GateEntryData[];
}

export default function GateClient({ initialEntries }: GateClientProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [showForm, setShowForm] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorName,
          purpose,
          vehiclePlate: vehiclePlate || undefined,
        }),
      });

      if (res.ok) {
        const newEntry = await res.json();
        setEntries([newEntry, ...entries]);
        setVisitorName("");
        setPurpose("");
        setVehiclePlate("");
        setShowForm(false);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout(id: string) {
    const res = await fetch("/api/gate", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setEntries(
        entries.map((e) =>
          e.id === id ? { ...e, status: "out", exitTime: new Date() } : e
        )
      );
    }
  }

  const activeCount = entries.filter((e) => e.status === "in").length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Keamanan Gerbang
          </h1>
          <p className="text-sm text-gray-600">
            Pencatatan pengunjung masuk dan keluar.{" "}
            <span className="font-medium text-yellow-600">
              {activeCount} tamu aktif
            </span>
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <>
              <X className="mr-1 h-4 w-4" /> Batal
            </>
          ) : (
            <>
              <Plus className="mr-1 h-4 w-4" /> Catat Pengunjung
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <h2 className="mb-4 text-lg font-semibold">Pengunjung Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="visitor-name"
              label="Nama Pengunjung"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              required
            />
            <Input
              id="purpose"
              label="Tujuan"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Contoh: Berkunjung ke Blok A No. 12"
              required
            />
            <Input
              id="vehicle"
              label="Plat Kendaraan (opsional)"
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
              placeholder="Contoh: B 1234 ABC"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Mencatat..." : "Catat Masuk"}
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {entries.length === 0 ? (
          <Card className="text-center">
            <p className="text-gray-500">Belum ada catatan pengunjung</p>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {entry.visitorName}
                    </span>
                    <Badge
                      className={
                        entry.status === "in"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }
                    >
                      {entry.status === "in" ? "Di Dalam" : "Sudah Keluar"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    Tujuan: {entry.purpose}
                  </p>
                  {entry.vehiclePlate && (
                    <p className="text-sm text-gray-500">
                      Kendaraan: {entry.vehiclePlate}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    Masuk: {formatDateTime(entry.entryTime)} &bull; Dicatat oleh{" "}
                    {entry.recordedByUser.name}
                    {entry.exitTime &&
                      ` • Keluar: ${formatDateTime(entry.exitTime)}`}
                  </p>
                </div>
                {entry.status === "in" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCheckout(entry.id)}
                  >
                    <LogOut className="mr-1 h-3 w-3" /> Keluar
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

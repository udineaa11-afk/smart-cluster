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

interface GateStandaloneClientProps {
  initialEntries: GateEntryData[];
}

export default function GateStandaloneClient({
  initialEntries,
}: GateStandaloneClientProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [showForm, setShowForm] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [loading, setLoading] = useState(false);

  const activeEntries = entries.filter((e) => e.status === "in");
  const pastEntries = entries.filter((e) => e.status !== "in");

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

  return (
    <div className="space-y-6">
      {/* Quick action bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-yellow-600 text-lg">
              {activeEntries.length}
            </span>{" "}
            tamu saat ini di dalam
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="w-full sm:w-auto">
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

      {/* Entry form */}
      {showForm && (
        <Card>
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
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Mencatat..." : "Catat Masuk"}
            </Button>
          </form>
        </Card>
      )}

      {/* Active visitors */}
      {activeEntries.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Tamu Aktif
          </h2>
          <div className="space-y-3">
            {activeEntries.map((entry) => (
              <Card key={entry.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 truncate">
                        {entry.visitorName}
                      </span>
                      <Badge className="bg-green-100 text-green-800 shrink-0">
                        Di Dalam
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 truncate">
                      {entry.purpose}
                    </p>
                    {entry.vehiclePlate && (
                      <p className="text-sm text-gray-500">
                        {entry.vehiclePlate}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      Masuk: {formatDateTime(entry.entryTime)}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCheckout(entry.id)}
                    className="w-full sm:w-auto"
                  >
                    <LogOut className="mr-1 h-3 w-3" /> Keluar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past visitors */}
      {pastEntries.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Riwayat
          </h2>
          <div className="space-y-2">
            {pastEntries.map((entry) => (
              <Card key={entry.id} className="!p-3">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {entry.visitorName}
                      </span>
                      <Badge className="bg-gray-100 text-gray-600 shrink-0 text-xs">
                        Keluar
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {entry.purpose}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 shrink-0 ml-2">
                    {formatDateTime(entry.entryTime)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && !showForm && (
        <Card className="text-center py-8">
          <p className="text-gray-500">Belum ada catatan pengunjung hari ini</p>
          <Button onClick={() => setShowForm(true)} className="mt-4">
            <Plus className="mr-1 h-4 w-4" /> Catat Pengunjung Pertama
          </Button>
        </Card>
      )}
    </div>
  );
}

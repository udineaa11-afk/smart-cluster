"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { Plus, X, Users, Newspaper, Map, Cat } from "lucide-react";

interface PlanData {
  id: string;
  name: string;
  displayName: string;
  price: number;
  maxUsers: number;
  maxNews: number;
  maxMapBlocks: number;
  maxCats: number;
  features: string;
  isActive: boolean;
  _count: { subscriptions: number };
}

interface PlansClientProps {
  initialPlans: PlanData[];
}

export default function PlansClient({ initialPlans }: PlansClientProps) {
  const [plans, setPlans] = useState(initialPlans);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [price, setPrice] = useState("");
  const [maxUsers, setMaxUsers] = useState("50");
  const [maxNews, setMaxNews] = useState("100");
  const [maxMapBlocks, setMaxMapBlocks] = useState("20");
  const [maxCats, setMaxCats] = useState("50");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.toLowerCase().replace(/\s+/g, "_"),
          displayName,
          price: Number(price) || 0,
          maxUsers: Number(maxUsers),
          maxNews: Number(maxNews),
          maxMapBlocks: Number(maxMapBlocks),
          maxCats: Number(maxCats),
          features: JSON.stringify([
            "news_wall",
            "map_builder",
            "gate_security",
            "cat_registry",
          ]),
        }),
      });

      if (res.ok) {
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  }

  async function togglePlan(id: string, isActive: boolean) {
    const res = await fetch("/api/admin/plans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive }),
    });

    if (res.ok) {
      setPlans(plans.map((p) => (p.id === id ? { ...p, isActive } : p)));
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Paket Langganan
          </h1>
          <p className="text-sm text-gray-600">
            Kelola paket harga dan batas fitur
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <>
              <X className="mr-1 h-4 w-4" /> Batal
            </>
          ) : (
            <>
              <Plus className="mr-1 h-4 w-4" /> Tambah Paket
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <h2 className="mb-4 text-lg font-semibold">Paket Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="plan-display-name"
                label="Nama Tampilan"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Contoh: Paket Premium"
                required
              />
              <Input
                id="plan-name"
                label="Kode Paket"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: premium"
                required
              />
              <Input
                id="plan-price"
                label="Harga/Bulan (Rp)"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
              />
              <Input
                id="plan-max-users"
                label="Maks. Pengguna"
                type="number"
                value={maxUsers}
                onChange={(e) => setMaxUsers(e.target.value)}
              />
              <Input
                id="plan-max-news"
                label="Maks. Berita"
                type="number"
                value={maxNews}
                onChange={(e) => setMaxNews(e.target.value)}
              />
              <Input
                id="plan-max-blocks"
                label="Maks. Blok Peta"
                type="number"
                value={maxMapBlocks}
                onChange={(e) => setMaxMapBlocks(e.target.value)}
              />
              <Input
                id="plan-max-cats"
                label="Maks. Kucing"
                type="number"
                value={maxCats}
                onChange={(e) => setMaxCats(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Buat Paket"}
            </Button>
          </form>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.length === 0 ? (
          <Card className="text-center col-span-full">
            <p className="text-gray-500">Belum ada paket</p>
          </Card>
        ) : (
          plans.map((plan) => (
            <Card
              key={plan.id}
              className={!plan.isActive ? "opacity-60" : ""}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {plan.displayName}
                  </h3>
                  <p className="text-sm text-gray-500 font-mono">
                    {plan.name}
                  </p>
                </div>
                <button
                  onClick={() => togglePlan(plan.id, !plan.isActive)}
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    plan.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {plan.isActive ? "Aktif" : "Nonaktif"}
                </button>
              </div>

              <p className="mt-3 text-3xl font-bold text-gray-900">
                Rp {plan.price.toLocaleString("id-ID")}
                <span className="text-sm font-normal text-gray-500">
                  /bulan
                </span>
              </p>

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Maks. {plan.maxUsers} pengguna</span>
                </div>
                <div className="flex items-center gap-2">
                  <Newspaper className="h-4 w-4" />
                  <span>Maks. {plan.maxNews} berita</span>
                </div>
                <div className="flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  <span>Maks. {plan.maxMapBlocks} blok peta</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cat className="h-4 w-4" />
                  <span>Maks. {plan.maxCats} kucing</span>
                </div>
              </div>

              <p className="mt-4 text-xs text-gray-400">
                {plan._count.subscriptions} klaster menggunakan paket ini
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

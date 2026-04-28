"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Plus, X, Building2 } from "lucide-react";

interface PlanData {
  id: string;
  name: string;
  displayName: string;
  price: number;
}

interface ClusterData {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  createdAt: Date;
  subscription: {
    status: string;
    plan: PlanData;
    currentPeriodEnd: Date;
  } | null;
  _count: {
    users: number;
    news: number;
    mapBlocks: number;
    cats: number;
    gateEntries: number;
  };
}

interface ClustersClientProps {
  initialClusters: ClusterData[];
  plans: PlanData[];
}

export default function ClustersClient({
  initialClusters,
  plans,
}: ClustersClientProps) {
  const [clusters] = useState(initialClusters);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [planId, setPlanId] = useState(plans[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/clusters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          address,
          adminName,
          adminEmail,
          adminPassword,
          planId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }

      window.location.reload();
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manajemen Klaster
          </h1>
          <p className="text-sm text-gray-600">
            Kelola semua klaster terdaftar di platform
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <>
              <X className="mr-1 h-4 w-4" /> Batal
            </>
          ) : (
            <>
              <Plus className="mr-1 h-4 w-4" /> Tambah Klaster
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <h2 className="mb-4 text-lg font-semibold">Klaster Baru</h2>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="cluster-name"
                label="Nama Klaster"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                id="cluster-address"
                label="Alamat"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <Input
                id="cluster-desc"
                label="Deskripsi"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Paket Langganan
                </label>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.displayName} - Rp {p.price.toLocaleString("id-ID")}/bln
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <hr className="my-4" />
            <h3 className="font-medium text-gray-700">Admin Klaster</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                id="admin-name"
                label="Nama Admin"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
              />
              <Input
                id="admin-email"
                label="Email Admin"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
              />
              <Input
                id="admin-pass"
                label="Password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Membuat..." : "Buat Klaster"}
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {clusters.length === 0 ? (
          <Card className="text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">Belum ada klaster terdaftar</p>
          </Card>
        ) : (
          clusters.map((cluster) => (
            <Card key={cluster.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {cluster.name}
                    </h3>
                    <Badge
                      className={
                        cluster.subscription?.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }
                    >
                      {cluster.subscription?.plan.displayName || "Tanpa paket"}
                    </Badge>
                  </div>
                  {cluster.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {cluster.description}
                    </p>
                  )}
                  {cluster.address && (
                    <p className="text-sm text-gray-500">{cluster.address}</p>
                  )}
                  <div className="mt-3 flex gap-4 text-xs text-gray-500">
                    <span>{cluster._count.users} pengguna</span>
                    <span>{cluster._count.news} berita</span>
                    <span>{cluster._count.mapBlocks} blok peta</span>
                    <span>{cluster._count.cats} kucing</span>
                    <span>{cluster._count.gateEntries} catatan gerbang</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Dibuat: {formatDate(cluster.createdAt)}
                    {cluster.subscription && (
                      <>
                        {" "}&bull; Berakhir:{" "}
                        {formatDate(cluster.subscription.currentPeriodEnd)}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { formatDate, getCategoryLabel, getCategoryColor } from "@/lib/utils";
import { Plus, X } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  category: string;
  createdAt: Date;
  author: { name: string };
}

interface NewsClientProps {
  initialNews: NewsItem[];
  isAdmin: boolean;
}

export default function NewsClient({ initialNews, isAdmin }: NewsClientProps) {
  const [news, setNews] = useState(initialNews);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, isPublic, category }),
      });

      if (res.ok) {
        const newItem = await res.json();
        setNews([newItem, ...news]);
        setTitle("");
        setContent("");
        setIsPublic(true);
        setCategory("general");
        setShowForm(false);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Berita</h1>
          <p className="text-sm text-gray-600">
            Kelola berita dan pengumuman klaster
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? (
              <>
                <X className="mr-1 h-4 w-4" /> Batal
              </>
            ) : (
              <>
                <Plus className="mr-1 h-4 w-4" /> Tambah Berita
              </>
            )}
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-6">
          <h2 className="mb-4 text-lg font-semibold">Buat Berita Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="title"
              label="Judul"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Konten
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="general">Umum</option>
                  <option value="announcement">Pengumuman</option>
                  <option value="event">Acara</option>
                  <option value="emergency">Darurat</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  Publik (terlihat oleh tamu)
                </label>
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </form>
        </Card>
      )}

      {news.length === 0 ? (
        <Card className="text-center">
          <p className="text-gray-500">Belum ada berita</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <Card key={item.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(item.category)}>
                      {getCategoryLabel(item.category)}
                    </Badge>
                    {!item.isPublic && (
                      <Badge className="bg-gray-100 text-gray-600">
                        Privat
                      </Badge>
                    )}
                    <span className="text-xs text-gray-400">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                    {item.content}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    Oleh {item.author.name}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

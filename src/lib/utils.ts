import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    general: "Umum",
    announcement: "Pengumuman",
    event: "Acara",
    emergency: "Darurat",
  };
  return labels[category] || category;
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    general: "bg-blue-100 text-blue-800",
    announcement: "bg-yellow-100 text-yellow-800",
    event: "bg-green-100 text-green-800",
    emergency: "bg-red-100 text-red-800",
  };
  return colors[category] || "bg-gray-100 text-gray-800";
}

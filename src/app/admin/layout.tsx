import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Super Admin - Smart Cluster",
  description: "Panel pengelola Smart Cluster SaaS",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  );
}

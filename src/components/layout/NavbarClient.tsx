"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, LayoutDashboard, LogOut, User } from "lucide-react";

interface NavbarClientProps {
  user: { name: string; role: string } | null;
}

export default function NavbarClient({ user }: NavbarClientProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        <LogIn className="h-4 w-4" />
        Masuk
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </Link>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <User className="h-4 w-4" />
        <span>{user.name}</span>
      </div>
      <button
        onClick={handleLogout}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Keluar
      </button>
    </div>
  );
}

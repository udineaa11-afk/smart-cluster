"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn, LayoutDashboard, LogOut, User, Menu, X } from "lucide-react";

interface NavbarClientProps {
  user: { name: string; role: string } | null;
}

export default function NavbarClient({ user }: NavbarClientProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <LogIn className="h-4 w-4" />
          Masuk
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden sm:flex items-center gap-4">
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

      {/* Mobile */}
      <div className="sm:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-gray-600"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        {mobileOpen && (
          <div className="absolute right-2 top-14 z-50 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <div className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500">
              <User className="h-4 w-4" />
              <span className="truncate">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </div>
        )}
      </div>
    </>
  );
}

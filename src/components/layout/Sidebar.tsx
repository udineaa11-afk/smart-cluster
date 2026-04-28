"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Newspaper,
  Map,
  Shield,
  PawPrint,
  Settings,
  Flag,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userRole: string;
}

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isAdmin = userRole === "admin" || userRole === "rw_admin" || userRole === "rt_admin";

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    { href: "/dashboard/news", label: "Berita", icon: Newspaper, show: true },
    { href: "/dashboard/map", label: "Peta", icon: Map, show: true },
    {
      href: "/dashboard/gate",
      label: "Keamanan",
      icon: Shield,
      show: userRole === "admin" || userRole === "security",
    },
    { href: "/dashboard/pets", label: "Hewan", icon: PawPrint, show: true },
    {
      href: "/dashboard/feature-flags",
      label: "Fitur",
      icon: Flag,
      show: isAdmin,
    },
    {
      href: "/dashboard/settings",
      label: "Pengaturan",
      icon: Settings,
      show: isAdmin,
    },
  ];

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg lg:hidden"
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white pt-16 transition-transform duration-200 lg:static lg:translate-x-0 lg:pt-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="flex-1 space-y-1 px-3 py-4">
          {links
            .filter((l) => l.show)
            .map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
        </nav>
      </aside>
    </>
  );
}

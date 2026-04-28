"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  Map,
  Shield,
  Cat,
  Settings,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userRole: string;
}

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

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
    { href: "/dashboard/cats", label: "Kucing", icon: Cat, show: true },
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
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <nav className="flex-1 space-y-1 px-3 py-4">
        {links
          .filter((l) => l.show)
          .map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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
  );
}

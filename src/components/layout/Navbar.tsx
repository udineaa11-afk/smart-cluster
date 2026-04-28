import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
                SC
              </div>
              <span className="text-lg font-bold text-gray-900">
                Smart Cluster
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Beranda
              </Link>
              <Link
                href="/peta"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Peta
              </Link>
            </div>
          </div>
          <NavbarClient user={user ? { name: user.name, role: user.role } : null} />
        </div>
      </div>
    </nav>
  );
}

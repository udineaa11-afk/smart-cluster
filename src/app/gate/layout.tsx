import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function GateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin" && user.role !== "security") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500 text-white font-bold text-sm">
                🛡
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Pos Keamanan</h1>
                <p className="text-xs text-gray-500">{user.cluster?.name || "Smart Cluster"}</p>
              </div>
            </div>
            <a
              href="/dashboard"
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Dashboard →
            </a>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-4 sm:px-6 sm:py-6">
        {children}
      </main>
    </div>
  );
}

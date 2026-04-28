"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";

interface FeatureFlagData {
  id: string;
  key: string;
  label: string;
  enabled: boolean;
}

interface FeatureFlagsClientProps {
  initialFlags: FeatureFlagData[];
}

export default function FeatureFlagsClient({
  initialFlags,
}: FeatureFlagsClientProps) {
  const [flags, setFlags] = useState(initialFlags);

  async function handleToggle(id: string, enabled: boolean) {
    const res = await fetch("/api/feature-flags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, enabled }),
    });

    if (res.ok) {
      setFlags(flags.map((f) => (f.id === id ? { ...f, enabled } : f)));
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feature Flags</h1>
        <p className="text-sm text-gray-600">
          Aktifkan atau nonaktifkan fitur untuk klaster anda
        </p>
      </div>

      <div className="space-y-3">
        {flags.length === 0 ? (
          <Card className="text-center">
            <p className="text-gray-500">
              Belum ada feature flags. Fitur akan ditambahkan saat klaster
              dibuat.
            </p>
          </Card>
        ) : (
          flags.map((flag) => (
            <Card key={flag.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{flag.label}</p>
                  <p className="text-sm text-gray-500 font-mono">{flag.key}</p>
                </div>
                <button
                  onClick={() => handleToggle(flag.id, !flag.enabled)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    flag.enabled ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      flag.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

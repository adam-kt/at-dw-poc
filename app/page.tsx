"use client";

import { useState } from "react";
import { ElectionTabs } from "./components/ElectionTabs";
import { ZipcodeForm } from "./components/ZipcodeForm";
import { hasFeaturedRaces } from "./lib/election-data";
import type { ElectionLookupResponse } from "./types";

export default function Home() {
  const [data, setData] = useState<ElectionLookupResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookup(zipcode: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/elections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zipcode }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Lookup failed");
      }
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  const elections = data?.elections.filter(hasFeaturedRaces);
  const authority = data?.authority;
  const state = data?.address.state;

  return (
    <main className="bg-page-bg min-h-screen px-4 py-12">
      <div className="mx-auto flex w-full max-w-[1048px] flex-col gap-8">
        <ZipcodeForm onSubmit={lookup} loading={loading} error={error} />

        {data && elections && elections.length === 0 && (
          <p className="text-ink-700 text-center">
            No upcoming elections found for {data.address.zipcode}.
          </p>
        )}

        {data && elections && elections.length > 0 && (
          <ElectionTabs
            elections={elections}
            authority={authority}
            state={state}
          />
        )}
      </div>
    </main>
  );
}

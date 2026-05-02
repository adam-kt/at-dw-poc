"use client";

import { useState } from "react";
import { ElectionTabs } from "./components/ElectionTabs";
import { ZipcodeForm } from "./components/ZipcodeForm";
import { hasBallotContent } from "./lib/election-data";
import type { ElectionLookupResponse } from "./types";

const ELECTION_PREVIEWS: { label: string; color: string }[] = [
  { label: "Special Election", color: "#369b99" },
  { label: "Primary Election", color: "#ff476c" },
  { label: "Second Primary Election", color: "#9c4fff" },
  { label: "General Election", color: "#4a86ff" },
];

export default function Home() {
  const [data, setData] = useState<ElectionLookupResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookup(query: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/elections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
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

  const elections = data?.elections.filter(hasBallotContent) ?? [];

  const subtext = data
    ? "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    : "Put in your address to find your elections";

  return (
    <main className="bg-page-bg min-h-screen px-4 py-12">
      <div className="mx-auto flex w-full max-w-[1048px] flex-col gap-8">
        <section className="flex flex-col items-center gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-brand-purple text-[32px] leading-[1.2] font-extrabold">
              Upcoming Elections
            </h1>
            <p className="text-ink-700 max-w-[640px] text-base leading-[1.5]">
              {subtext}
            </p>
          </div>
          <ZipcodeForm onSubmit={lookup} loading={loading} error={error} />
          {!data && (
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-ink-900 text-base leading-[1.5] font-bold">
                Choose an election below to get valuable voting and ballot
                information.
              </h2>
              <div
                aria-hidden="true"
                className="flex flex-wrap items-center justify-center gap-3"
              >
                {ELECTION_PREVIEWS.map((p) => (
                  <span
                    key={p.label}
                    className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white opacity-80"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {data && (
          elections.length === 0 ? (
            <p className="text-ink-700 text-center">
              No upcoming elections found for {data.address.zipcode}.
            </p>
          ) : (
            <ElectionTabs
              elections={elections}
              authority={data.authority}
              state={data.address.state}
            />
          )
        )}
      </div>
    </main>
  );
}

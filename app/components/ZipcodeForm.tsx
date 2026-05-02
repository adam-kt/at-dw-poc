"use client";

import { useState } from "react";

interface ZipcodeFormProps {
  onSubmit: (query: string) => void;
  loading: boolean;
  error: string | null;
}

export function ZipcodeForm({ onSubmit, loading, error }: ZipcodeFormProps) {
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!loading && trimmed.length > 0) {
      onSubmit(trimmed);
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <form
        onSubmit={handleSubmit}
        role="search"
        className="border-card-border shadow-card flex w-full max-w-[420px] items-center gap-2 rounded-lg border border-solid bg-white px-3 py-2"
      >
        <label htmlFor="address-query" className="sr-only">
          Enter your address or ZIP code
        </label>
        <svg
          className="text-ink-500 size-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          id="address-query"
          type="text"
          autoComplete="street-address"
          placeholder="Enter your address"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          className="text-ink-900 placeholder:text-ink-500 min-w-0 flex-1 bg-transparent text-sm leading-[1.5] outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || query.trim().length === 0}
          className="bg-brand-purple hover:bg-brand-purple-dark focus-visible:ring-offset-page-bg shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

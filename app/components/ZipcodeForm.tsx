"use client";

import { Button, TextInput } from "flowbite-react";
import { useState } from "react";

interface ZipcodeFormProps {
  onSubmit: (zipcode: string) => void;
  loading: boolean;
  error: string | null;
}

export function ZipcodeForm({ onSubmit, loading, error }: ZipcodeFormProps) {
  const [zipcode, setZipcode] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!loading && /^\d{5}$/.test(zipcode)) {
      onSubmit(zipcode);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-card-border shadow-card flex w-full flex-col items-center gap-3 rounded-xl border border-solid bg-white px-4 py-6 sm:flex-row"
    >
      <label
        htmlFor="zipcode"
        className="text-ink-900 text-base font-semibold sm:shrink-0"
      >
        Find your election by ZIP code
      </label>
      <TextInput
        id="zipcode"
        type="text"
        inputMode="numeric"
        pattern="\d{5}"
        maxLength={5}
        placeholder="12345"
        value={zipcode}
        onChange={(e) => setZipcode(e.target.value)}
        disabled={loading}
        className="w-full sm:max-w-[160px]"
      />
      <Button
        type="submit"
        disabled={loading || !/^\d{5}$/.test(zipcode)}
        className="bg-brand-purple hover:bg-brand-purple-dark"
      >
        {loading ? "Looking up..." : "Look up"}
      </Button>
      {error && (
        <p className="text-sm text-red-600 sm:ml-auto" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

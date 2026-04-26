"use client";

import { useState } from "react";

const PARTIES = [
  { name: "Democrat", color: "#1a56db" },
  { name: "Republican", color: "#ec0023" },
  { name: "Other", color: "#6a42ea" },
] as const;

type PartyName = (typeof PARTIES)[number]["name"];

const RACES = ["Race 1", "Race 2", "Race 3", "Race 4", "Race 5", "Race 6", "Race 7"];

const PLACEHOLDER_CANDIDATES = [
  "Neil Sims",
  "Bonnie Green",
  "Micheal Gough",
  "Thomas Lean",
  "Lana Byrd",
];

function ChevronRight({ color, open }: { color: string; open: boolean }) {
  return (
    <svg
      className={`size-2.5 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 1.5L6.5 5L3 8.5"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PartyTag({
  name,
  color,
  open,
  onClick,
}: {
  name: PartyName;
  color: string;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className="inline-flex items-center gap-2 rounded border border-solid bg-white pr-1.5 pl-2 transition-opacity hover:opacity-80"
      style={{ borderColor: color }}
    >
      <span className="text-xs leading-[1.5] font-bold" style={{ color }}>
        {name}
      </span>
      <ChevronRight color={color} open={open} />
    </button>
  );
}

function CandidateRow({ name }: { name: string }) {
  return (
    <div className="flex w-full items-center gap-0 overflow-clip border-b border-solid border-[#e5e7eb] py-2.5">
      <div className="flex flex-1 items-center gap-2">
        <div className="flex flex-1 flex-col leading-[1.5]">
          <p className="text-base font-semibold whitespace-nowrap text-[#111928]">
            {name}
          </p>
          <p className="text-xs font-medium text-[#6b7280]">Party Affiliation</p>
        </div>
      </div>
      <button
        type="button"
        className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-solid border-[#e5e7eb] bg-white px-3 py-2 text-sm leading-[1.5] font-medium text-[#111928] hover:bg-gray-50"
      >
        Website
      </button>
    </div>
  );
}

function RaceRow({ name }: { name: string }) {
  const [openParty, setOpenParty] = useState<PartyName | null>(null);

  const toggle = (party: PartyName) => {
    setOpenParty((current) => (current === party ? null : party));
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-t border-r border-b border-l-[5px] border-solid border-[#cbcbcb] bg-white px-6 py-4">
      <p className="text-[18px] leading-[1.5] font-bold text-[#111928]">
        {name}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        {PARTIES.map((p) => (
          <PartyTag
            key={p.name}
            name={p.name}
            color={p.color}
            open={openParty === p.name}
            onClick={() => toggle(p.name)}
          />
        ))}
      </div>
      {openParty && (
        <div className="mt-2 flex w-full flex-col">
          {PLACEHOLDER_CANDIDATES.map((candidate) => (
            <CandidateRow key={candidate} name={candidate} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Ballot() {
  return (
    <div className="flex w-full flex-col items-center gap-4 rounded-xl border border-solid border-[#f0f0f0] bg-white px-4 py-6 shadow-[0px_2px_1px_rgba(0,0,0,0.15)]">
      <div className="flex flex-col items-center gap-3 px-4 text-center">
        <h2 className="text-[26px] leading-[1.25] font-extrabold text-[#111928]">
          Who&rsquo;s on my ballot?
        </h2>
        <p className="text-[18px] leading-[1.5] font-medium text-[#3a3a3a]">
          Choose a party&rsquo;s primary by race to view candidates.
        </p>
      </div>

      <div className="flex w-full flex-col gap-6">
        {RACES.map((r) => (
          <RaceRow key={r} name={r} />
        ))}
      </div>
    </div>
  );
}

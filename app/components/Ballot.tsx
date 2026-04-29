"use client";

import { useState } from "react";
import { Card } from "./Card";

const PARTIES = [
  { name: "Democrat", color: "#1a56db" },
  { name: "Republican", color: "#ec0023" },
  { name: "Other", color: "#6a42ea" },
] as const;

export type PartyName = (typeof PARTIES)[number]["name"];

export interface BallotCandidate {
  name: string;
  partyAffiliation: string;
  websiteUrl?: string;
}

export interface BallotRace {
  name: string;
  candidatesByParty: Map<PartyName, BallotCandidate[]>;
}

const PLACEHOLDER_RACES: BallotRace[] = Array.from({ length: 7 }, (_, i) => ({
  name: `Race ${i + 1}`,
  candidatesByParty: new Map<PartyName, BallotCandidate[]>([
    [
      "Democrat",
      ["Neil Sims", "Bonnie Green", "Micheal Gough", "Thomas Lean", "Lana Byrd"].map(
        (name) => ({ name, partyAffiliation: "Democrat" }),
      ),
    ],
    [
      "Republican",
      ["Neil Sims", "Bonnie Green", "Micheal Gough", "Thomas Lean", "Lana Byrd"].map(
        (name) => ({ name, partyAffiliation: "Republican" }),
      ),
    ],
    [
      "Other",
      ["Neil Sims", "Bonnie Green", "Micheal Gough", "Thomas Lean", "Lana Byrd"].map(
        (name) => ({ name, partyAffiliation: "Independent" }),
      ),
    ],
  ]),
}));

interface OpenSelection {
  raceIndex: number;
  party: PartyName;
}

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
      className="inline-flex min-w-0 shrink items-center gap-1.5 rounded border border-solid bg-white pr-1.5 pl-2 transition-opacity hover:opacity-80 sm:gap-2"
      style={{ borderColor: color }}
    >
      <span
        className="truncate text-xs leading-[1.5] font-bold"
        style={{ color }}
      >
        {name}
      </span>
      <ChevronRight color={color} open={open} />
    </button>
  );
}

function CandidateRow({ candidate }: { candidate: BallotCandidate }) {
  return (
    <div className="border-row-divider flex w-full items-center gap-0 overflow-clip border-b border-solid py-2.5 last:border-b-0">
      <div className="flex flex-1 items-center gap-2">
        <div className="flex flex-1 flex-col leading-[1.5]">
          <p className="text-ink-900 text-base font-semibold whitespace-nowrap">
            {candidate.name}
          </p>
          <p className="text-ink-500 text-xs font-medium">
            {candidate.partyAffiliation}
          </p>
        </div>
      </div>
      {candidate.websiteUrl && (
        <a
          href={candidate.websiteUrl}
          target="_blank"
          rel="noreferrer"
          className="border-row-divider text-ink-900 flex shrink-0 items-center justify-center gap-2 rounded-lg border border-solid bg-white px-3 py-2 text-sm leading-[1.5] font-medium hover:bg-gray-50"
        >
          Website
        </a>
      )}
    </div>
  );
}

function RaceRow({
  race,
  raceIndex,
  openSelection,
  onToggle,
}: {
  race: BallotRace;
  raceIndex: number;
  openSelection: OpenSelection | null;
  onToggle: (raceIndex: number, party: PartyName) => void;
}) {
  const isOpen =
    openSelection?.raceIndex === raceIndex ? openSelection.party : null;
  const visibleParties = PARTIES.filter(
    (p) => (race.candidatesByParty.get(p.name)?.length ?? 0) > 0,
  );
  const candidates = isOpen ? race.candidatesByParty.get(isOpen) ?? [] : [];

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-t border-r border-b border-l-[5px] border-solid border-[#cbcbcb] bg-white px-6 py-4">
      <p className="text-ink-900 text-[18px] leading-[1.5] font-bold">
        {race.name}
      </p>
      <div className="flex flex-nowrap items-center gap-2 sm:gap-3">
        {visibleParties.map((p) => (
          <PartyTag
            key={p.name}
            name={p.name}
            color={p.color}
            open={isOpen === p.name}
            onClick={() => onToggle(raceIndex, p.name)}
          />
        ))}
      </div>
      {isOpen && candidates.length > 0 && (
        <div className="mt-2 flex w-full flex-col">
          {candidates.map((c) => (
            <CandidateRow key={c.name} candidate={c} />
          ))}
        </div>
      )}
    </div>
  );
}

interface BallotProps {
  races?: BallotRace[];
}

export function Ballot({ races }: BallotProps) {
  const [openSelection, setOpenSelection] = useState<OpenSelection | null>(null);
  const data = races ?? PLACEHOLDER_RACES;

  const toggle = (raceIndex: number, party: PartyName) => {
    setOpenSelection((current) =>
      current?.raceIndex === raceIndex && current.party === party
        ? null
        : { raceIndex, party },
    );
  };

  return (
    <Card className="flex flex-col items-center gap-4 px-4 py-6">
      <div className="flex flex-col items-center gap-3 px-4 text-center">
        <h2 className="text-ink-900 text-[26px] leading-[1.25] font-extrabold">
          Who&rsquo;s on my ballot?
        </h2>
        <p className="text-ink-700 text-[18px] leading-[1.5] font-medium">
          Choose a party&rsquo;s primary by race to view candidates.
        </p>
      </div>

      {data.length === 0 ? (
        <p className="text-ink-500 text-sm">
          No US Senate, US House, Governor, or State Supreme Court races on this
          ballot.
        </p>
      ) : (
        <div className="flex w-full flex-col gap-6">
          {data.map((race, i) => (
            <RaceRow
              key={`${race.name}-${i}`}
              race={race}
              raceIndex={i}
              openSelection={openSelection}
              onToggle={toggle}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

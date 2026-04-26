"use client";

import { useState } from "react";
import { Ballot } from "./Ballot";
import { BallotIssues } from "./BallotIssues";
import { ElectionHeader } from "./ElectionHeader";
import { RegistrationDetails } from "./RegistrationDetails";
import { VotingDetails } from "./VotingDetails";
import { VotingFAQs } from "./VotingFAQs";

const ELECTIONS = [
  {
    color: "#369b99",
    state: "Virginia",
    electionType: "Constitutional Amendment Special Election",
    date: "September 13, 2026",
  },
  {
    color: "#ff476c",
    state: "Virginia",
    electionType: "Primary Election",
    date: "June 16, 2026",
  },
  {
    color: "#4a86ff",
    state: "Virginia",
    electionType: "General Election",
    date: "November 3, 2026",
  },
  {
    color: "#9c4fff",
    state: "Virginia",
    electionType: "Second Primary Election",
    date: "August 18, 2026",
  },
];

export function ElectionTabs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = ELECTIONS[activeIndex];

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label="Election type tabs"
        className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center"
      >
        {ELECTIONS.map((e, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            onClick={() => setActiveIndex(i)}
            className="flex h-[50px] w-full items-center justify-center rounded-lg px-5 py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
            style={{ backgroundColor: e.color }}
          >
            {e.state} {e.electionType}
          </button>
        ))}
      </div>

      <ElectionHeader
        state={active.state}
        electionType={active.electionType}
        date={active.date}
        accentColor={active.color}
      />

      <div
        key={activeIndex}
        className="flex flex-col gap-6 md:flex-row"
      >
        <div className="contents md:flex md:basis-3/5 md:flex-col md:gap-6">
          <div className="order-3 md:order-none">
            <Ballot />
          </div>
          <div className="order-4 md:order-none">
            <BallotIssues />
          </div>
        </div>
        <div className="contents md:flex md:basis-2/5 md:flex-col md:gap-6">
          <div className="order-1 md:order-none">
            <VotingDetails />
          </div>
          <div className="order-2 md:order-none">
            <RegistrationDetails />
          </div>
          <div className="order-5 md:order-none">
            <VotingFAQs />
          </div>
        </div>
      </div>
    </div>
  );
}

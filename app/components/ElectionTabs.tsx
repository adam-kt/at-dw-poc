"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import {
  ballotIssuesFromDW,
  compareElectionsByType,
  faqsFromDW,
  getElectionDateLabel,
  getElectionTypeMeta,
  racesFromDW,
  shouldUsePartyAccordions,
} from "../lib/election-data";
import type { DWAuthority, DWElection } from "../types";
import { Ballot } from "./Ballot";
import { BallotIssues } from "./BallotIssues";
import { ElectionHeader } from "./ElectionHeader";
import { RegistrationDetails } from "./RegistrationDetails";
import { VotingDetails } from "./VotingDetails";
import { VotingFAQs } from "./VotingFAQs";

interface TabModel {
  label: string;
  electionType: string;
  date: string;
  accentColor: string;
  election?: DWElection;
}

const PLACEHOLDER_TABS: TabModel[] = [
  {
    label: "Constitutional Amendment Special Election",
    electionType: "Constitutional Amendment Special Election",
    date: "September 13, 2026",
    accentColor: "#369b99",
  },
  {
    label: "Primary Election",
    electionType: "Primary Election",
    date: "June 16, 2026",
    accentColor: "#ff476c",
  },
  {
    label: "General Election",
    electionType: "General Election",
    date: "November 3, 2026",
    accentColor: "#4a86ff",
  },
  {
    label: "Second Primary Election",
    electionType: "Second Primary Election",
    date: "August 18, 2026",
    accentColor: "#9c4fff",
  },
];

const PLACEHOLDER_STATE = "Virginia";

interface ElectionTabsProps {
  elections?: DWElection[];
  authority?: DWAuthority | null;
  state?: string;
}

export function ElectionTabs({
  elections,
  authority,
  state,
}: ElectionTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const idPrefix = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const stripStatePrefix = (desc: string) => {
    if (!state) return desc.trim();
    const lower = desc.trim().toLowerCase();
    return lower.startsWith(state.toLowerCase())
      ? desc.trim().slice(state.length).trim()
      : desc.trim();
  };

  const tabs: TabModel[] =
    elections && elections.length > 0
      ? [...elections].sort(compareElectionsByType).map((e) => {
          const meta = getElectionTypeMeta(e);
          const label = stripStatePrefix(e.description);
          return {
            label,
            electionType: label,
            date: getElectionDateLabel(e),
            accentColor: meta.color,
            election: e,
          };
        })
      : PLACEHOLDER_TABS;

  const displayState = state ?? PLACEHOLDER_STATE;
  const safeIndex = Math.min(activeIndex, tabs.length - 1);
  const active = tabs[safeIndex];
  const activeElection = active.election;
  const tabId = (i: number) => `${idPrefix}-tab-${i}`;
  const panelId = (i: number) => `${idPrefix}-panel-${i}`;

  const focusTab = (index: number) => {
    setActiveIndex(index);
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        focusTab((safeIndex + 1) % tabs.length);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        focusTab((safeIndex - 1 + tabs.length) % tabs.length);
        break;
      case "Home":
        e.preventDefault();
        focusTab(0);
        break;
      case "End":
        e.preventDefault();
        focusTab(tabs.length - 1);
        break;
    }
  };

  const races = activeElection ? racesFromDW(activeElection) : undefined;
  const usePartyAccordions = activeElection
    ? shouldUsePartyAccordions(activeElection, state)
    : false;
  const issues = activeElection ? ballotIssuesFromDW(activeElection) : undefined;
  const faqs = activeElection
    ? faqsFromDW(activeElection, authority)
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label="Election type tabs"
        onKeyDown={handleKeyDown}
        className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center"
      >
        {tabs.map((t, i) => (
          <button
            key={`${t.label}-${t.date}-${i}`}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={tabId(i)}
            aria-controls={panelId(i)}
            aria-selected={i === safeIndex}
            tabIndex={i === safeIndex ? 0 : -1}
            onClick={() => setActiveIndex(i)}
            className="flex min-h-[50px] w-full items-center justify-center rounded-lg px-5 py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-page-bg sm:w-auto"
            style={{ backgroundColor: t.accentColor }}
          >
            {displayState} {t.label}
          </button>
        ))}
      </div>

      <div
        key={safeIndex}
        role="tabpanel"
        id={panelId(safeIndex)}
        aria-labelledby={tabId(safeIndex)}
        tabIndex={0}
        className="flex flex-col gap-6 focus:outline-none"
      >
        <ElectionHeader
          state={displayState}
          electionType={active.electionType}
          date={active.date}
          accentColor={active.accentColor}
        />

        <div className="flex flex-col gap-6 md:flex-row">
          <div className="contents md:flex md:basis-3/5 md:flex-col md:gap-6">
            <div className="order-3 md:order-none">
              <Ballot races={races} flat={!usePartyAccordions} />
            </div>
            {issues && issues.length > 0 && (
              <div className="order-4 md:order-none">
                <BallotIssues items={issues} />
              </div>
            )}
          </div>
          <div className="contents md:flex md:basis-2/5 md:flex-col md:gap-6">
            <div className="order-1 md:order-none">
              <VotingDetails election={activeElection} />
            </div>
            <div className="order-2 md:order-none">
              <RegistrationDetails election={activeElection} />
            </div>
            {faqs && faqs.length > 0 && (
              <div className="order-5 md:order-none">
                <VotingFAQs items={faqs} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

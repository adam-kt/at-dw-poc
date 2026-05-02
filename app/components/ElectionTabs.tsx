"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
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

interface ElectionTabsProps {
  elections: DWElection[];
  authority: DWAuthority | null;
  state: string;
}

export function ElectionTabs({
  elections,
  authority,
  state,
}: ElectionTabsProps) {
  const sorted = [...elections].sort(compareElectionsByType);
  const [activeIndex, setActiveIndex] = useState(0);
  const idPrefix = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (activeIndex >= elections.length) setActiveIndex(0);
  }, [elections.length, activeIndex]);

  const stripStatePrefix = (desc: string) => {
    const trimmed = desc.trim();
    return trimmed.toLowerCase().startsWith(state.toLowerCase())
      ? trimmed.slice(state.length).trim()
      : trimmed;
  };

  const tabs = sorted.map((e) => {
    const meta = getElectionTypeMeta(e);
    return {
      label: stripStatePrefix(e.description),
      date: getElectionDateLabel(e),
      accentColor: meta.color,
      election: e,
    };
  });

  const safeIndex = Math.min(activeIndex, tabs.length - 1);
  const active = tabs[safeIndex];
  const tabId = (i: number) => `${idPrefix}-tab-${i}`;
  const panelId = (i: number) => `${idPrefix}-panel-${i}`;

  const focusTab = (i: number) => {
    setActiveIndex(i);
    tabRefs.current[i]?.focus();
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

  const races = racesFromDW(active.election);
  const usePartyAccordions = shouldUsePartyAccordions(active.election, state);
  const issues = ballotIssuesFromDW(active.election);
  const faqs = faqsFromDW(active.election, authority);

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
            key={`${t.label}-${t.date}`}
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
            {state} {t.label}
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
          state={state}
          electionType={active.label}
          date={active.date}
          accentColor={active.accentColor}
        />

        <div className="flex flex-col gap-6 md:flex-row">
          <div className="contents md:flex md:basis-3/5 md:flex-col md:gap-6">
            {races.length > 0 && (
              <div className="order-3 md:order-none">
                <Ballot races={races} flat={!usePartyAccordions} />
              </div>
            )}
            {issues.length > 0 && (
              <div className="order-4 md:order-none">
                <BallotIssues items={issues} />
              </div>
            )}
          </div>
          <div className="contents md:flex md:basis-2/5 md:flex-col md:gap-6">
            <div className="order-1 md:order-none">
              <VotingDetails election={active.election} />
            </div>
            <div className="order-2 md:order-none">
              <RegistrationDetails election={active.election} />
            </div>
            {faqs.length > 0 && (
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

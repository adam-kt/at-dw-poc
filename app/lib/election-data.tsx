import type { ReactNode } from "react";
import type { AccordionItem } from "../components/AccordionCard";
import type { BallotCandidate, BallotRace, PartyName } from "../components/Ballot";
import type { DetailsRow } from "../components/DetailsCard";
import { MailboxIcon, PersonIcon, WindowIcon } from "../components/icons";
import type { DWAuthority, DWElection, DWQuestionAndAnswer } from "../types";

interface ElectionTypeMeta {
  color: string;
  label: string;
  order: number;
  isPrimary: boolean;
}

function fallbackMeta(type: string | undefined): ElectionTypeMeta {
  if (!type) {
    return {
      color: "#6a42ea",
      label: "Election",
      order: 99,
      isPrimary: false,
    };
  }
  const formatted = type
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    color: "#6a42ea",
    label: /election$/i.test(formatted) ? formatted : `${formatted} Election`,
    order: 99,
    isPrimary: false,
  };
}

interface ElectionLike {
  type?: string;
  description?: string;
}

export function getElectionTypeMeta(
  election: ElectionLike | string | undefined,
): ElectionTypeMeta {
  const obj: ElectionLike =
    typeof election === "string"
      ? { type: election }
      : (election ?? {});
  const text = `${obj.description ?? ""} ${obj.type ?? ""}`.toLowerCase();
  if (!text.trim()) return fallbackMeta(obj.type);

  // Most-specific first (second/runoff outrank plain "primary")
  if (/(second.?primary|primary.?runoff)/.test(text)) {
    return {
      color: "#9c4fff",
      label: "Second Primary Election",
      order: 4,
      isPrimary: true,
    };
  }
  if (/runoff/.test(text)) {
    return {
      color: "#9c4fff",
      label: "Runoff Election",
      order: 4,
      isPrimary: false,
    };
  }
  if (/primary/.test(text)) {
    return {
      color: "#ff476c",
      label: "Primary Election",
      order: 2,
      isPrimary: true,
    };
  }
  if (/general/.test(text)) {
    return {
      color: "#4a86ff",
      label: "General Election",
      order: 3,
      isPrimary: false,
    };
  }
  if (/(special|constitutional)/.test(text)) {
    return {
      color: "#369b99",
      label: "Special Election",
      order: 1,
      isPrimary: false,
    };
  }

  return fallbackMeta(obj.type);
}

export function getElectionAccent(type: string | undefined): string {
  return getElectionTypeMeta(type).color;
}

export function getElectionTypeLabel(type: string | undefined): string {
  return getElectionTypeMeta(type).label;
}

// States with non-partisan / top-two / "jungle" primaries — all candidates
// appear together regardless of party, so no party split is shown.
const NON_PARTISAN_PRIMARY_STATES = new Set(["California", "Washington", "Alaska"]);

export function shouldUsePartyAccordions(
  election: ElectionLike,
  state?: string,
): boolean {
  if (!getElectionTypeMeta(election).isPrimary) return false;
  if (state && NON_PARTISAN_PRIMARY_STATES.has(state)) return false;
  return true;
}

export function compareElectionsByType(
  a: ElectionLike,
  b: ElectionLike,
): number {
  return getElectionTypeMeta(a).order - getElectionTypeMeta(b).order;
}

function formatDate(input: string | null | undefined): string | null {
  if (!input) return null;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(input: string | null | undefined): string | null {
  if (!input) return null;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  });
}

export function getElectionDateLabel(election: DWElection): string {
  return formatDate(election.date) ?? election.date;
}

export function votingRowsFromDW(election: DWElection): DetailsRow[] {
  const rows: DetailsRow[] = [];
  const { voting } = election;

  const earlyStart = formatShortDate(voting.early.startDate);
  const earlyEnd = formatShortDate(voting.early.endDate);
  if (earlyStart && earlyEnd) {
    rows.push({
      label: "Early Voting",
      value: `${earlyStart} - ${earlyEnd}`,
      icon: PersonIcon,
    });
  }

  const electionDayClose = voting.inPerson.electionDay.closing.description
    ?? voting.inPerson.electionDay.closing.timestamp;
  if (electionDayClose) {
    rows.push({
      label: "In person",
      value: electionDayClose,
      icon: PersonIcon,
    });
  }

  const ballotReturnByMail = formatShortDate(
    voting.byMail.deadline.returnByMail.date,
  );
  if (ballotReturnByMail) {
    rows.push({
      label: "By Mail",
      value: ballotReturnByMail,
      icon: MailboxIcon,
    });
  }

  if (voting.byMail.deadline.postmarkedOrReceived) {
    rows.push({
      label: "Must be",
      value:
        voting.byMail.deadline.postmarkedOrReceived.charAt(0).toUpperCase() +
        voting.byMail.deadline.postmarkedOrReceived.slice(1),
      icon: MailboxIcon,
    });
  }

  return rows;
}

function normalizeParty(affiliations: string[] | undefined): PartyName {
  if (!affiliations || affiliations.length === 0) return "Other";
  const first = affiliations[0].toLowerCase();
  if (first.includes("democrat")) return "Democrat";
  if (first.includes("republican")) return "Republican";
  return "Other";
}

const FEATURED_RACE_PATTERNS: RegExp[] = [
  /^u\.?s\.?\s+senat/i,
  /^united states senat/i,
  /^u\.?s\.?\s+(house|repres)/i,
  /^united states (house|representative)/i,
  /^representative in congress/i,
  /^governor$/i,
  /state\s+supreme\s+court/i,
  /supreme\s+court\s+(of|justice)/i,
];

function isFeaturedRace(contestName: string): boolean {
  return FEATURED_RACE_PATTERNS.some((p) => p.test(contestName.trim()));
}

export function hasFeaturedRaces(election: DWElection): boolean {
  return (
    election.contests?.some((c) => isFeaturedRace(c.name)) ?? false
  );
}

export function racesFromDW(election: DWElection): BallotRace[] {
  if (!election.contests) return [];

  const grouped = new Map<string, BallotRace>();

  for (const contest of election.contests) {
    if (!isFeaturedRace(contest.name)) continue;

    const race =
      grouped.get(contest.name) ??
      ({
        name: contest.name,
        candidatesByParty: new Map<PartyName, BallotCandidate[]>(),
      } satisfies BallotRace);

    for (const c of contest.candidates) {
      const party = normalizeParty(c.partyAffiliation);
      const arr = race.candidatesByParty.get(party) ?? [];
      if (arr.some((existing) => existing.name === c.fullName)) continue;
      arr.push({
        name: c.fullName,
        partyAffiliation: c.partyAffiliation?.[0] ?? "Independent",
        websiteUrl: c.contact?.campaign?.website ?? undefined,
      });
      race.candidatesByParty.set(party, arr);
    }

    grouped.set(contest.name, race);
  }

  return Array.from(grouped.values());
}

export function ballotIssuesFromDW(election: DWElection): AccordionItem[] {
  if (!election.ballotMeasures) return [];
  return election.ballotMeasures.map((bm) => ({
    title: bm.streamlinedName ?? bm.ballotQuestion ?? "Ballot Measure",
    content: (
      <div className="flex flex-col gap-3">
        {bm.summary && (
          <div>
            <p className="text-ink-900 mb-1 text-[16px] font-bold">Summary:</p>
            {renderHtml(bm.summary)}
          </div>
        )}
        {bm.yesVote && (
          <div>
            <p className="text-ink-900 mb-1 text-[16px] font-bold">
              A &ldquo;Yes&rdquo; vote means:
            </p>
            {renderHtml(bm.yesVote)}
          </div>
        )}
        {bm.ballotQuestion && (
          <div>
            <p className="text-ink-900 mb-1 text-[16px] font-bold">
              Ballot Question:
            </p>
            {renderHtml(bm.ballotQuestion)}
          </div>
        )}
      </div>
    ),
  }));
}

function sanitizeHtml(html: string): string {
  return (
    html
      // Lists nested inside <p> are invalid HTML; unwrap them
      .replace(
        /<p[^>]*>\s*(<(?:ul|ol)[\s\S]*?<\/(?:ul|ol)>)\s*<\/p>/gi,
        "$1",
      )
      // Drop empty paragraphs left behind by browser fix-ups
      .replace(/<p[^>]*>\s*<\/p>/gi, "")
      // Collapse stray double-blanks
      .replace(/(\s*<br\s*\/?>\s*){2,}/gi, "<br/>")
  );
}

function renderHtml(html: string): ReactNode {
  return (
    <div
      className="text-[16px] leading-[1.5] text-ink-700 [&_a]:text-brand-purple [&_a]:underline [&_p]:mb-3 [&_p:last-child]:mb-0 [&_p:empty]:hidden [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_strong]:font-bold [&_em]:italic [&_h2]:mb-2 [&_h2]:text-[18px] [&_h2]:font-bold [&_h2]:text-ink-900 [&_h3]:mb-2 [&_h3]:text-[16px] [&_h3]:font-bold [&_h3]:text-ink-900"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}

export function faqsFromDW(
  election: DWElection,
  authority?: DWAuthority | null,
): AccordionItem[] {
  const items: AccordionItem[] = [];
  const sources: (DWQuestionAndAnswer | undefined)[] = [
    election.questionAndAnswer,
    authority?.questionAndAnswer,
  ];
  const seen = new Set<string>();

  for (const source of sources) {
    if (!source) continue;
    for (const qa of Object.values(source)) {
      if (!qa?.question || !qa.answer) continue;
      if (seen.has(qa.question)) continue;
      seen.add(qa.question);
      items.push({
        title: qa.question,
        content: renderHtml(qa.answer),
      });
    }
  }

  return items;
}

export function registrationRowsFromDW(election: DWElection): DetailsRow[] {
  const rows: DetailsRow[] = [];
  const { registration } = election;

  const inPerson = formatShortDate(registration.inPerson.deadline.date);
  if (inPerson) {
    rows.push({ label: "In person", value: inPerson, icon: PersonIcon });
  }

  const online = formatShortDate(registration.online.deadline.date);
  if (online) {
    rows.push({ label: "Online", value: online, icon: WindowIcon });
  }

  const byMail = formatShortDate(registration.byMail.deadline.date);
  if (byMail) {
    rows.push({ label: "By Mail", value: byMail, icon: MailboxIcon });
  }

  if (registration.byMail.deadline.postmarkedOrReceived) {
    rows.push({
      label: "Must be",
      value:
        registration.byMail.deadline.postmarkedOrReceived
          .charAt(0)
          .toUpperCase() +
        registration.byMail.deadline.postmarkedOrReceived.slice(1),
      icon: MailboxIcon,
    });
  }

  return rows;
}

import DOMPurify from "isomorphic-dompurify";
import type { ReactNode } from "react";
import type { AccordionItem } from "../components/AccordionCard";
import type { BallotCandidate, BallotRace, PartyName } from "../components/Ballot";
import type { DetailsRow } from "../components/DetailsCard";
import { MailboxIcon, PersonIcon, WindowIcon } from "../components/icons";
import type { DWAuthority, DWElection, DWQuestionAndAnswer } from "../types";

interface ElectionLike {
  type?: string;
  description?: string;
}

interface ElectionTypeMeta {
  color: string;
  label: string;
  order: number;
  isPrimary: boolean;
}

const FALLBACK: ElectionTypeMeta = {
  color: "#6a42ea",
  label: "Election",
  order: 99,
  isPrimary: false,
};

export function getElectionTypeMeta(election: ElectionLike): ElectionTypeMeta {
  const text = `${election.description ?? ""} ${election.type ?? ""}`.toLowerCase();

  if (/(second.?primary|primary.?runoff)/.test(text)) {
    return { color: "#9c4fff", label: "Second Primary Election", order: 4, isPrimary: true };
  }
  if (/runoff/.test(text)) {
    return { color: "#9c4fff", label: "Runoff Election", order: 4, isPrimary: false };
  }
  if (/primary/.test(text)) {
    return { color: "#ff476c", label: "Primary Election", order: 2, isPrimary: true };
  }
  if (/general/.test(text)) {
    return { color: "#4a86ff", label: "General Election", order: 3, isPrimary: false };
  }
  if (/(special|constitutional)/.test(text)) {
    return { color: "#369b99", label: "Special Election", order: 1, isPrimary: false };
  }
  return FALLBACK;
}

// CA, WA, AK use top-two / non-partisan primaries — all candidates run together.
const NON_PARTISAN_PRIMARY_STATES = new Set(["California", "Washington", "Alaska"]);

export function shouldUsePartyAccordions(election: ElectionLike, state: string): boolean {
  return getElectionTypeMeta(election).isPrimary
    && !NON_PARTISAN_PRIMARY_STATES.has(state);
}

export function compareElectionsByType(a: ElectionLike, b: ElectionLike): number {
  return getElectionTypeMeta(a).order - getElectionTypeMeta(b).order;
}

function formatDate(input: string | null | undefined, short = false): string | null {
  if (!input) return null;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toLocaleDateString("en-US", short
    ? { month: "numeric", day: "numeric", year: "2-digit" }
    : { month: "long", day: "numeric", year: "numeric" });
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function getElectionDateLabel(election: DWElection): string {
  return formatDate(election.date) ?? election.date;
}

export function votingRowsFromDW(election: DWElection): DetailsRow[] {
  const rows: DetailsRow[] = [];
  const { voting } = election;

  const earlyStart = formatDate(voting.early.startDate, true);
  const earlyEnd = formatDate(voting.early.endDate, true);
  if (earlyStart && earlyEnd) {
    rows.push({ label: "Early Voting", value: `${earlyStart} - ${earlyEnd}`, icon: PersonIcon });
  }

  const closing = voting.inPerson.electionDay.closing;
  const electionDay = closing.description ?? closing.timestamp;
  if (electionDay) {
    rows.push({ label: "In person", value: electionDay, icon: PersonIcon });
  }

  const byMail = formatDate(voting.byMail.deadline.returnByMail.date, true);
  if (byMail) {
    rows.push({ label: "By Mail", value: byMail, icon: MailboxIcon });
  }

  const postmarked = voting.byMail.deadline.postmarkedOrReceived;
  if (postmarked) {
    rows.push({ label: "Must be", value: cap(postmarked), icon: MailboxIcon });
  }

  return rows;
}

export function registrationRowsFromDW(election: DWElection): DetailsRow[] {
  const rows: DetailsRow[] = [];
  const { registration } = election;

  const inPerson = formatDate(registration.inPerson.deadline.date, true);
  if (inPerson) rows.push({ label: "In person", value: inPerson, icon: PersonIcon });

  const online = formatDate(registration.online.deadline.date, true);
  if (online) rows.push({ label: "Online", value: online, icon: WindowIcon });

  const byMail = formatDate(registration.byMail.deadline.date, true);
  if (byMail) rows.push({ label: "By Mail", value: byMail, icon: MailboxIcon });

  const postmarked = registration.byMail.deadline.postmarkedOrReceived;
  if (postmarked) {
    rows.push({ label: "Must be", value: cap(postmarked), icon: MailboxIcon });
  }

  return rows;
}

function normalizeParty(affiliations: string[] | undefined): PartyName {
  const first = affiliations?.[0]?.toLowerCase() ?? "";
  if (first.includes("democrat")) return "Democrat";
  if (first.includes("republican")) return "Republican";
  return "Other";
}

const FEATURED_RACE_PATTERNS = [
  /^(u\.?\s*s\.?|united states)\s+senat/i,
  /^(u\.?\s*s\.?|united states)\s+(house|repres)/i,
  /^representative in congress/i,
  /^governor$/i,
  /supreme\s+court/i,
];

function isFeaturedRace(name: string): boolean {
  return FEATURED_RACE_PATTERNS.some((p) => p.test(name.trim()));
}

export function hasFeaturedRaces(election: DWElection): boolean {
  return election.contests?.some((c) => isFeaturedRace(c.name)) === true;
}

export function racesFromDW(election: DWElection): BallotRace[] {
  if (!election.contests) return [];
  const grouped = new Map<string, BallotRace>();

  for (const contest of election.contests) {
    if (!isFeaturedRace(contest.name)) continue;

    const race = grouped.get(contest.name) ?? {
      name: contest.name,
      candidatesByParty: new Map<PartyName, BallotCandidate[]>(),
    };

    for (const c of contest.candidates) {
      const party = normalizeParty(c.partyAffiliation);
      const arr = race.candidatesByParty.get(party) ?? [];
      if (arr.some((x) => x.name === c.fullName)) continue;
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

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "b", "i", "u",
  "ul", "ol", "li",
  "a", "h2", "h3", "h4",
  "blockquote",
];

function renderHtml(html: string): ReactNode {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
  return <div className="dw-prose" dangerouslySetInnerHTML={{ __html: clean }} />;
}

function labelledBlock(label: string, html: string): ReactNode {
  return (
    <div>
      <p className="text-ink-900 mb-1 text-[16px] font-bold">{label}</p>
      {renderHtml(html)}
    </div>
  );
}

export function ballotIssuesFromDW(election: DWElection): AccordionItem[] {
  if (!election.ballotMeasures) return [];
  return election.ballotMeasures.map((bm) => ({
    title: bm.streamlinedName ?? bm.ballotQuestion ?? "Ballot Measure",
    content: (
      <div className="flex flex-col gap-3">
        {bm.summary && labelledBlock("Summary:", bm.summary)}
        {bm.yesVote && labelledBlock("A “Yes” vote means:", bm.yesVote)}
        {bm.ballotQuestion && labelledBlock("Ballot Question:", bm.ballotQuestion)}
      </div>
    ),
  }));
}

export function faqsFromDW(
  election: DWElection,
  authority: DWAuthority | null,
): AccordionItem[] {
  const items: AccordionItem[] = [];
  const seen = new Set<string>();
  const sources: (DWQuestionAndAnswer | undefined)[] = [
    election.questionAndAnswer,
    authority?.questionAndAnswer,
  ];

  for (const source of sources) {
    if (!source) continue;
    for (const qa of Object.values(source)) {
      if (!qa?.question || !qa.answer || seen.has(qa.question)) continue;
      seen.add(qa.question);
      items.push({ title: qa.question, content: renderHtml(qa.answer) });
    }
  }
  return items;
}

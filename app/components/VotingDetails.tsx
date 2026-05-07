import { votingRowsFromDW } from "../lib/election-data";
import type { DWElection } from "../types";
import { DetailsCard } from "./DetailsCard";

export function VotingDetails({ election }: { election: DWElection }) {
  return (
    <DetailsCard
      heading="Voting Details"
      rows={votingRowsFromDW(election)}
      cta={{
        label: "Find polling location",
        href: election.pollingLocationUrl ?? election.website ?? "#",
        variant: "solid",
      }}
      subheading={
        <a
          href="#voting-faqs"
          className="text-ink-900 text-sm font-bold underline"
        >
          Visit FAQs below for additional information &raquo;
        </a>
      }
    />
  );
}

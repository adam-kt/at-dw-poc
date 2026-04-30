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
        variant: "outline",
      }}
    />
  );
}

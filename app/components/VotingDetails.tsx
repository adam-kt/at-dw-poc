import { votingRowsFromDW } from "../lib/election-data";
import type { DWElection } from "../types";
import { DetailsCard, type DetailsRow } from "./DetailsCard";
import { MailboxIcon, PersonIcon, WindowIcon } from "./icons";

const PLACEHOLDER_ROWS: DetailsRow[] = [
  { label: "Early Voting", value: "3.6.26 - 4.18.26", icon: PersonIcon },
  { label: "In person", value: "[Date Range]", icon: PersonIcon },
  { label: "Online", value: "[Date Range]", icon: WindowIcon },
  { label: "By Mail", value: "[Date Range]", icon: MailboxIcon },
  { label: "Must be", value: "Postmarked", icon: MailboxIcon },
];

interface VotingDetailsProps {
  election?: DWElection;
}

export function VotingDetails({ election }: VotingDetailsProps) {
  const rows = election ? votingRowsFromDW(election) : PLACEHOLDER_ROWS;
  return (
    <DetailsCard
      heading="Voting Details"
      rows={rows}
      cta={{
        label: "Find polling location",
        href:
          election?.pollingLocationUrl ??
          election?.website ??
          "https://www.elections.virginia.gov/casting-a-ballot/early-voting-office-locations/",
        variant: "outline",
      }}
    />
  );
}

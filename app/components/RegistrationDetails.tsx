import { registrationRowsFromDW } from "../lib/election-data";
import type { DWElection } from "../types";
import { DetailsCard, type DetailsRow } from "./DetailsCard";
import { MailboxIcon, PersonIcon, WindowIcon } from "./icons";

const PLACEHOLDER_ROWS: DetailsRow[] = [
  { label: "In person", value: "[Date Range]", icon: PersonIcon },
  { label: "Online", value: "[Date Range]", icon: WindowIcon },
  { label: "By Mail", value: "[Date Range]", icon: MailboxIcon },
  { label: "Must be", value: "Postmarked", icon: MailboxIcon },
];

interface RegistrationDetailsProps {
  election?: DWElection;
}

export function RegistrationDetails({ election }: RegistrationDetailsProps) {
  const rows = election
    ? registrationRowsFromDW(election)
    : PLACEHOLDER_ROWS;
  return (
    <DetailsCard
      heading="Registration Details"
      rows={rows}
      cta={{
        label: "Register to Vote",
        href:
          election?.registration.online.url ??
          "https://www.elections.virginia.gov/registration/how-to-register/",
        variant: "solid",
      }}
    />
  );
}

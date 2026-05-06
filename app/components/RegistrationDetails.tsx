import { registrationRowsFromDW } from "../lib/election-data";
import type { DWElection } from "../types";
import { DetailsCard } from "./DetailsCard";

export function RegistrationDetails({ election }: { election: DWElection }) {
  return (
    <DetailsCard
      heading="Registration Deadlines"
      rows={registrationRowsFromDW(election)}
      cta={{
        label: "Register to Vote",
        href: election.registration.online.url ?? "#",
        variant: "solid",
      }}
    />
  );
}

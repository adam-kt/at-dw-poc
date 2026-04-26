import { Badge } from "flowbite-react";
import type { ComponentProps, FC } from "react";
import { MailboxIcon, PersonIcon, WindowIcon } from "./icons";

interface VotingDetailRow {
  label: string;
  value: string;
  icon: FC<ComponentProps<"svg">>;
}

const ROWS: VotingDetailRow[] = [
  { label: "Early Voting", value: "3.6.26 - 4.18.26", icon: PersonIcon },
  { label: "In person", value: "[Date Range]", icon: PersonIcon },
  { label: "Online", value: "[Date Range]", icon: WindowIcon },
  { label: "By Mail", value: "[Date Range]", icon: MailboxIcon },
  { label: "Must be", value: "Postmarked", icon: MailboxIcon },
];

export function VotingDetails() {
  return (
    <div className="flex w-full flex-col items-start gap-6 rounded-xl border border-solid border-[#f0f0f0] bg-white px-6 py-[30px] shadow-[0px_2px_1px_rgba(0,0,0,0.15)]">
      <div className="flex w-full items-center justify-center">
        <h2 className="flex-1 text-[20px] leading-6 font-bold text-[#111928]">
          Voting Details
        </h2>
      </div>

      <Badge color="success" size="sm">
        xxxxxxxxxx
      </Badge>

      <div className="flex w-full flex-col">
        {ROWS.map((row) => {
          const Icon = row.icon;
          return (
            <div
              key={row.label}
              className="flex w-full items-center gap-2 overflow-clip border-b border-solid border-[#e5e7eb] py-2.5"
            >
              <div className="flex flex-1 items-center gap-2">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#f3f4f6]">
                  <Icon className="size-4 text-[#6a42ea]" />
                </div>
                <p className="text-sm leading-[1.5] font-semibold whitespace-nowrap text-[#111928]">
                  {row.label}
                </p>
              </div>
              <p className="text-right text-sm leading-[1.5] font-semibold whitespace-nowrap text-[#111928]">
                {row.value}
              </p>
            </div>
          );
        })}
      </div>

      <a
        href="https://www.elections.virginia.gov/casting-a-ballot/early-voting-office-locations/"
        target="_blank"
        rel="noreferrer"
        className="flex w-full items-center justify-center rounded-lg border border-solid border-[#6a42ea] bg-white px-3 py-2 text-sm leading-[1.5] font-bold text-[#6a42ea] underline transition-opacity hover:opacity-80"
      >
        Find polling location
      </a>
    </div>
  );
}

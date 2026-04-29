import { Badge, Button } from "flowbite-react";
import type { ComponentProps, FC } from "react";
import { Card } from "./Card";

export interface DetailsRow {
  label: string;
  value: string;
  icon: FC<ComponentProps<"svg">>;
}

interface DetailsCardCTA {
  label: string;
  href: string;
  variant: "outline" | "solid";
}

interface DetailsCardProps {
  heading: string;
  badge?: string;
  rows: DetailsRow[];
  cta: DetailsCardCTA;
}

const solidColorTheme = {
  color: {
    brand:
      "bg-brand-purple text-white hover:bg-brand-purple-dark focus:ring-4 focus:ring-purple-200",
  },
};

const outlineColorTheme = {
  outlineColor: {
    brand:
      "border border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white focus:ring-4 focus:ring-purple-200",
  },
};

export function DetailsCard({ heading, badge, rows, cta }: DetailsCardProps) {
  return (
    <Card className="flex flex-col items-start gap-6 px-6 py-[30px]">
      <h2 className="text-ink-900 w-full text-[20px] leading-6 font-bold">
        {heading}
      </h2>

      {badge && (
        <Badge color="success" size="sm">
          {badge}
        </Badge>
      )}

      <div className="flex w-full flex-col">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div
              key={row.label}
              className="border-row-divider flex w-full items-center gap-2 overflow-clip border-b border-solid py-2.5"
            >
              <div className="flex flex-1 items-center gap-2">
                <div className="bg-tile-bg flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="text-brand-purple size-4" />
                </div>
                <p className="text-ink-900 text-sm leading-[1.5] font-semibold whitespace-nowrap">
                  {row.label}
                </p>
              </div>
              <p className="text-ink-900 text-right text-sm leading-[1.5] font-semibold whitespace-nowrap">
                {row.value}
              </p>
            </div>
          );
        })}
      </div>

      {cta.variant === "solid" ? (
        <Button
          as="a"
          href={cta.href}
          target="_blank"
          rel="noreferrer"
          color="brand"
          fullSized
          theme={solidColorTheme}
          className="text-sm font-bold"
        >
          {cta.label}
        </Button>
      ) : (
        <Button
          as="a"
          href={cta.href}
          target="_blank"
          rel="noreferrer"
          outline
          color="brand"
          fullSized
          theme={outlineColorTheme}
          className="text-sm font-bold"
        >
          {cta.label}
        </Button>
      )}
    </Card>
  );
}

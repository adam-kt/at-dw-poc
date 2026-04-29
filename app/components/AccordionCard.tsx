"use client";

import {
  Accordion,
  AccordionContent,
  AccordionPanel,
  AccordionTitle,
} from "flowbite-react";
import type { ComponentProps, FC, ReactNode } from "react";
import { Card } from "./Card";

const ChevronDown: FC<ComponentProps<"svg">> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M3 4.5L6 7.5L9 4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const rootTheme = {
  base: "flex flex-col gap-6 divide-y-0",
  flush: {
    off: "border-0 rounded-none",
    on: "border-0",
  },
};

const titleTheme = {
  base: "flex w-full items-center justify-between rounded-t-lg last:rounded-b-none border-b border-solid border-row-divider bg-tile-bg px-3 py-3 text-left",
  heading: "flex-1 text-[16px] leading-6 font-bold text-brand-purple-dark",
  open: { on: "", off: "" },
  flush: { on: "", off: "hover:bg-gray-200 focus:outline-none" },
  arrow: {
    base: "size-3 shrink-0 text-brand-purple-dark transition-transform",
    open: { on: "rotate-180", off: "" },
  },
};

const contentTheme = {
  base: "px-4 py-1.5 text-[16px] text-ink-700",
};

export interface AccordionItem {
  title: string;
  content: ReactNode;
}

interface AccordionCardProps {
  heading: string;
  subheading?: ReactNode;
  items: AccordionItem[];
  innerPaddingY?: string;
}

export function AccordionCard({
  heading,
  subheading,
  items,
  innerPaddingY = "py-6",
}: AccordionCardProps) {
  return (
    <Card className={`flex flex-col items-center gap-4 px-4 ${innerPaddingY}`}>
      <div className="flex flex-col items-center gap-3 px-4 text-center">
        <h2 className="text-ink-900 text-[26px] leading-[1.25] font-extrabold">
          {heading}
        </h2>
        {subheading && (
          <div className="text-ink-700 text-[18px] leading-[1.5] font-medium">
            {subheading}
          </div>
        )}
      </div>

      <Accordion
        collapseAll
        arrowIcon={ChevronDown}
        theme={rootTheme}
        className="w-full"
      >
        {items.map((item) => (
          <AccordionPanel key={item.title}>
            <AccordionTitle theme={titleTheme}>{item.title}</AccordionTitle>
            <AccordionContent theme={contentTheme}>
              {item.content}
            </AccordionContent>
          </AccordionPanel>
        ))}
      </Accordion>
    </Card>
  );
}

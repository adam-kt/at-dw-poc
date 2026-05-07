import { Button } from "flowbite-react";
import { Card } from "./Card";

const solidColorTheme = {
  color: {
    brand:
      "bg-brand-purple text-white hover:bg-brand-purple-dark focus:ring-4 focus:ring-purple-200",
  },
};

export function StateLocalCallout({ href }: { href: string }) {
  return (
    <Card className="flex flex-col items-center gap-4 px-4 py-6">
      <div className="flex flex-col items-center gap-3 px-4 text-center">
        <h2 className="text-ink-900 text-[26px] leading-[1.25] font-extrabold">
          State &amp; Local Elections:
        </h2>
        <p className="text-ink-700 text-sm leading-[1.5] font-medium">
          We currently track Presidential, Congressional, and statewide races.
          For all other state and local elections, please visit your Secretary
          of State website below.
        </p>
      </div>
      <Button
        as="a"
        href={href}
        target="_blank"
        rel="noreferrer"
        color="brand"
        fullSized
        theme={solidColorTheme}
        className="text-sm font-bold"
      >
        Website URL
      </Button>
    </Card>
  );
}

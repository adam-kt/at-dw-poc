import { AccordionCard, type AccordionItem } from "./AccordionCard";

const ISSUES: AccordionItem[] = [
  {
    title: "Require Voter Identification Amendment",
    content: (
      <div className="flex flex-col gap-3 text-[16px] leading-[1.5] text-[#3a3a3a]">
        <div>
          <p className="font-bold">Summary:</p>
          <p>
            Require photographic identification to vote for all voters, not just
            those voting in person
          </p>
        </div>
        <div>
          <p className="font-bold">A &ldquo;Yes&rdquo; vote means:</p>
          <p>
            A &ldquo;yes&rdquo; vote supports amending the constitution to require
            photo identification to vote for all voters, not just those voting in
            person.
          </p>
        </div>
        <p>Third text block if needed.</p>
      </div>
    ),
  },
  {
    title: "Where can I access my download files?",
    content: <p className="text-[16px] text-[#3a3a3a]">Placeholder content.</p>,
  },
  {
    title: "Can I use FlowBite for commercial purposes?",
    content: <p className="text-[16px] text-[#3a3a3a]">Placeholder content.</p>,
  },
  {
    title: "What about browser support?",
    content: <p className="text-[16px] text-[#3a3a3a]">Placeholder content.</p>,
  },
];

export function BallotIssues() {
  return (
    <AccordionCard
      heading="What's on my ballot?"
      subheading={
        <p>
          xxxxxxx
          <br />
          xxxxxxx
        </p>
      }
      items={ISSUES}
    />
  );
}

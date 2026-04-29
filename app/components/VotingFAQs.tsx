import { AccordionCard, type AccordionItem } from "./AccordionCard";

const PLACEHOLDER_FAQS: AccordionItem[] = [
  {
    title: "Require Voter Identification Amendment",
    content: (
      <div className="text-ink-700 flex flex-col gap-3 text-[16px] leading-[1.5]">
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
    content: <p className="text-ink-700 text-[16px]">Placeholder content.</p>,
  },
  {
    title: "Can I use FlowBite for commercial purposes?",
    content: <p className="text-ink-700 text-[16px]">Placeholder content.</p>,
  },
  {
    title: "What about browser support?",
    content: <p className="text-ink-700 text-[16px]">Placeholder content.</p>,
  },
];

interface VotingFAQsProps {
  items?: AccordionItem[];
}

export function VotingFAQs({ items }: VotingFAQsProps) {
  const data = items && items.length > 0 ? items : PLACEHOLDER_FAQS;
  return (
    <AccordionCard
      heading="Voting FAQs"
      subheading={
        <p>
          xxxxxxx
          <br />
          xxxxxxx
        </p>
      }
      items={data}
      innerPaddingY="py-8"
    />
  );
}

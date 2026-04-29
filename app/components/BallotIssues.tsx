import { AccordionCard, type AccordionItem } from "./AccordionCard";

interface BallotIssuesProps {
  items: AccordionItem[];
}

export function BallotIssues({ items }: BallotIssuesProps) {
  return (
    <AccordionCard
      heading="What's on my ballot?"
      subheading={
        <p>Review the ballot measures for this election.</p>
      }
      items={items}
    />
  );
}

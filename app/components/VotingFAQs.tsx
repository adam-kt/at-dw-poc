import { AccordionCard, type AccordionItem } from "./AccordionCard";

interface VotingFAQsProps {
  items: AccordionItem[];
}

export function VotingFAQs({ items }: VotingFAQsProps) {
  return (
    <AccordionCard heading="Voting FAQs" items={items} innerPaddingY="py-8" />
  );
}

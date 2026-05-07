interface ElectionHeaderProps {
  state: string;
  electionType: string;
  date: string;
  accentColor: string;
}

export function ElectionHeader({
  state,
  electionType,
  date,
  accentColor,
}: ElectionHeaderProps) {
  return (
    <div
      className="shadow-card flex w-full flex-col items-center gap-[15px] rounded-xl border-t-[7px] border-solid bg-white py-[30px]"
      style={{ borderTopColor: accentColor }}
    >
      <h2
        className="text-center text-[24px] leading-6 font-extrabold"
        style={{ color: accentColor }}
      >
        {state} {electionType}
      </h2>
      <div
        className="inline-flex items-center justify-center gap-2 rounded-md border-[1.5px] border-solid bg-white px-3 py-2"
        style={{ borderColor: accentColor, color: accentColor }}
      >
        <svg
          className="size-3"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
        </svg>
        <span className="text-sm leading-[1.5] font-extrabold whitespace-nowrap">
          {date}
        </span>
      </div>
    </div>
  );
}

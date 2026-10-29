/** The mark is a folded chit with a hand-drawn question mark on it. */
export function LogoMark({ className = "", tone = "paper" }: { className?: string; tone?: "paper" | "ink" }) {
  const paper = tone === "paper" ? "#FFFFFF" : "#2940D9";
  const stroke = tone === "paper" ? "#13195A" : "#FFFFFF";
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path d="M6 9.5 31.5 6l2.5 24.5L8.5 34z" fill={paper} stroke="#13195A" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M24 6.9 31.5 6l.9 8.4z" fill="#FFD43B" stroke="#13195A" strokeWidth="2.4" strokeLinejoin="round" />
      <path
        d="M15.6 16.4c.4-2.9 2.6-4.4 5.2-4.1 2.6.3 4.2 2.3 3.9 4.6-.3 2.4-2.6 3.2-4 4.3-.9.7-1.1 1.5-1.1 2.6"
        fill="none"
        stroke={stroke}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="19.5" cy="27.4" r="1.7" fill={stroke} />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className="h-8 w-8 -rotate-6" />
      <span className="stretch-wide text-[1.45rem] leading-none font-extrabold tracking-[-0.02em]">poocho</span>
    </span>
  );
}

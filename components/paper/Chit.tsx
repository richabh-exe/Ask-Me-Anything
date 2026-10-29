import type { CSSProperties, ReactNode } from "react";

type Tone = "white" | "haldi" | "pink" | "blue";

const TONES: Record<Tone, string> = {
  white: "bg-white",
  haldi: "bg-haldi-soft",
  pink: "bg-[#fde3e8]",
  blue: "bg-[#e3e9ff]",
};

interface ChitProps {
  children?: ReactNode;
  className?: string;
  innerClassName?: string;
  tone?: Tone;
  torn?: boolean;
  ruled?: boolean;
  margin?: boolean;
  /** Distance between rules. Match it to the line-height of handwriting inside. */
  line?: string;
  style?: CSSProperties;
}

/** A strip torn from a ruled notebook. The wrapper carries the shadow, since clip-path would cut it. */
export function Chit({
  children,
  className = "",
  innerClassName = "",
  tone = "white",
  torn = true,
  ruled = true,
  margin = true,
  line = "2.25rem",
  style,
}: ChitProps) {
  return (
    <div className={`paper-shadow ${className}`} style={style}>
      <div
        className={`relative rounded-[4px] ${TONES[tone]} ${torn ? "torn" : ""} ${ruled ? "ruled" : ""} ${margin ? "margin-line" : ""} ${innerClassName}`}
        style={{ "--line": line } as CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}

/** A chit folded twice: what a question looks like in transit and in a tray. */
export function FoldedChit({ className = "", tone = "white" }: { className?: string; tone?: "white" | "pink" }) {
  const fill = tone === "pink" ? "#FDE3E8" : "#FFFFFF";
  return (
    <svg viewBox="0 0 64 44" className={className} aria-hidden="true">
      <path d="M3 8.5 58 3l3 31.5L6 41z" fill={fill} stroke="#13195A" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M31.5 5.8 33 38" stroke="#13195A" strokeWidth="1.6" strokeDasharray="0" opacity=".45" />
      <path d="M4.6 23.5 59.6 18.8" stroke="#13195A" strokeWidth="1.6" opacity=".45" />
      <path d="M48 4.1 58 3l.9 9.6z" fill={tone === "pink" ? "#E8445F" : "#FFD43B"} stroke="#13195A" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

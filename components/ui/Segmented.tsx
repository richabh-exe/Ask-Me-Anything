"use client";

import { motion } from "motion/react";
import { useId, useRef } from "react";

interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

/** A radio group drawn as a row of options with a highlighter swipe behind the chosen one. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  name,
}: {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  name?: string;
}) {
  const labelId = useId();
  const group = name ?? labelId;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = options.findIndex((o) => o.value === value);
  const active = options[index];

  const move = (delta: number) => {
    const next = (index + delta + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div>
      <p id={labelId} className="font-semibold">
        {label}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="mt-2 flex flex-wrap gap-1 rounded-[14px] border-2 border-navy bg-white p-1"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            move(1);
          } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            move(-1);
          }
        }}
      >
        {options.map((o, i) => {
          const checked = o.value === value;
          return (
            <button
              key={o.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              onClick={() => onChange(o.value)}
              className="relative min-h-11 flex-1 rounded-[10px] px-3 py-2 text-[0.98rem] font-semibold whitespace-nowrap"
            >
              {checked && (
                <motion.span
                  layoutId={`seg-${group}`}
                  className="absolute inset-0 -rotate-[0.6deg] rounded-[9px] bg-haldi"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{o.label}</span>
            </button>
          );
        })}
      </div>
      {active?.hint && <p className="mt-2 text-[0.95rem] text-navy-soft">{active.hint}</p>}
    </div>
  );
}

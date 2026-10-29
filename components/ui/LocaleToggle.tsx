"use client";

import { useI18n, type Locale } from "@/lib/i18n";

const OPTIONS: { value: Locale; label: string; name: string }[] = [
  { value: "en", label: "EN", name: "English" },
  { value: "hi", label: "हिं", name: "हिंदी" },
];

export function LocaleToggle({ tone = "ink" }: { tone?: "ink" | "paper" }) {
  const { locale, setLocale } = useI18n();
  const ring = tone === "ink" ? "border-white/40" : "border-navy/25";
  return (
    <div role="group" aria-label="Language / भाषा" className={`flex rounded-full border-2 ${ring} p-0.5`}>
      {OPTIONS.map((o) => {
        const active = o.value === locale;
        return (
          <button
            key={o.value}
            type="button"
            lang={o.value}
            aria-pressed={active}
            aria-label={o.name}
            onClick={() => setLocale(o.value)}
            className={`h-8 min-w-10 rounded-full px-2.5 text-[0.95rem] font-semibold transition-colors ${
              active
                ? tone === "ink"
                  ? "bg-white text-navy"
                  : "bg-navy text-white"
                : tone === "ink"
                  ? "text-white/85 hover:text-white"
                  : "text-navy/70 hover:text-navy"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

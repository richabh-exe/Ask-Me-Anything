const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

export function timeAgo(timestamp: number, now = Date.now(), locale = "en"): string {
  const seconds = Math.min(0, Math.round((timestamp - now) / 1000));
  if (Math.abs(seconds) < 45) return locale === "hi" ? "अभी" : "just now";
  const format = new Intl.RelativeTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", { numeric: "auto" });
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
  }
  return format.format(Math.round(seconds / 60), "minute");
}

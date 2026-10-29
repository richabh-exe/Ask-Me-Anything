import type { FilterLevel, LinkMode } from "./types";

export const MODE_OPTIONS: { value: LinkMode; label: string; hint: string }[] = [
  { value: "anonymous", label: "Anonymous", hint: "No names. You see only the question and when it was sent." },
  { value: "choice", label: "Asker's choice", hint: "Anonymous by default. Askers can choose to show their name." },
  { value: "named", label: "Named", hint: "Askers must add their name, and they're told it will be shown." },
];

export const FILTER_OPTIONS: { value: FilterLevel; label: string; hint: string }[] = [
  { value: "relaxed", label: "Relaxed", hint: "Only clear abuse, threats and personal details are filtered." },
  { value: "standard", label: "Standard", hint: "Insults, swearing, sexual messages, threats and personal details are filtered." },
  { value: "strict", label: "Strict", hint: "Also filters mild teasing like “cringe” or “pagal”." },
];

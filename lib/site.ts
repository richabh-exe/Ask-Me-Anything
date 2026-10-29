const CONFIGURED = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
const FALLBACK = "https://poocho.app";

/** The host shown on cards and links. Set NEXT_PUBLIC_SITE_URL in production. */
export function siteOrigin(): string {
  if (CONFIGURED) return CONFIGURED;
  if (typeof window !== "undefined") return window.location.origin;
  return FALLBACK;
}

/** What siteOrigin() returns during server rendering, so hydration can match it. */
export function serverOrigin(): string {
  return CONFIGURED ?? FALLBACK;
}

export function displayHost(origin = siteOrigin()): string {
  return origin.replace(/^https?:\/\//, "");
}

export function askUrl(handle: string): string {
  return `${siteOrigin()}/@${handle}`;
}

export function askPath(handle: string): string {
  return `/@${handle}`;
}

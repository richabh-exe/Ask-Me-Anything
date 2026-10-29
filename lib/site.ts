/** The host shown on cards and links. Set NEXT_PUBLIC_SITE_URL in production. */
export function siteOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "https://poocho.app";
}

export function displayHost(): string {
  return siteOrigin().replace(/^https?:\/\//, "");
}

export function askUrl(handle: string): string {
  return `${siteOrigin()}/@${handle}`;
}

export function askPath(handle: string): string {
  return `/@${handle}`;
}

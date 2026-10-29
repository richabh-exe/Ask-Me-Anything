import "server-only";
import { absoluteUrl } from "../seo";
import { serverOrigin } from "../site";

/*
 * IndexNow tells Bing, Yandex and others the moment a page changes, instead of
 * waiting for a crawl. The key is public by design and is served from
 * public/<key>.txt at the site root.
 *
 * Pings only go out from production on our own domain. While the site still
 * lives on *.vercel.app they stay off, so search engines learn the final
 * address first (playbook: Domain move, step 6).
 */
export const INDEXNOW_KEY = "af6a0850195b35b59f1eb4e91d93b7b5";

export function indexNowEnabled(origin = serverOrigin(), env = process.env.VERCEL_ENV): boolean {
  const { hostname } = new URL(origin);
  return env === "production" && !hostname.endsWith(".vercel.app") && hostname !== "localhost";
}

export async function pingIndexNow(paths: string[]): Promise<void> {
  if (!paths.length || !indexNowEnabled()) return;
  const origin = serverOrigin();
  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(origin).hostname,
        key: INDEXNOW_KEY,
        keyLocation: `${origin}/${INDEXNOW_KEY}.txt`,
        urlList: paths.map((path) => absoluteUrl(path)),
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    /* A missed ping only means the page waits for the next crawl. */
  }
}

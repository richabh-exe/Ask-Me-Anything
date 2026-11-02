import type { NextConfig } from "next";

// PostHog's ingestion host for the project's region, and its asset host beside it.
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
const posthogAssets = posthogHost.replace(".i.posthog.com", "-assets.i.posthog.com");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // posthog-js posts to paths like /chai/e/, and Next.js would answer each one
  // with a 308 to drop the slash. proxy.ts still strips it from real pages.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      // Ask pages live at /@handle, as in the PRD. Folders starting with "@" are
      // reserved for parallel routes, so the page itself sits at /u/[handle].
      { source: "/@:handle", destination: "/u/:handle" },
      // PostHog through our own domain (lib/analytics.ts), so tracking blockers
      // don't drop host events. A bland name on purpose: blockers match words
      // like /analytics or /posthog. Static and array must precede the catch-all.
      { source: "/chai/static/:path*", destination: `${posthogAssets}/static/:path*` },
      { source: "/chai/array/:path*", destination: `${posthogAssets}/array/:path*` },
      { source: "/chai/:path*", destination: `${posthogHost}/:path*` },
    ];
  },
};

export default nextConfig;

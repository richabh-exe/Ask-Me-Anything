import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Host screens need a session. Ask pages, the landing page and /start stay public.
const isHostRoute = createRouteMatcher(["/inbox(.*)", "/settings(.*)", "/admin(.*)"]);

/*
 * One address for Google (playbook: Domain move, step 3). Once
 * NEXT_PUBLIC_SITE_URL names our own domain, production requests that arrive
 * on *.vercel.app get a permanent redirect there, path and UTM tags intact, so
 * every story card already shared with the old link keeps working. While the
 * site still lives on vercel.app this does nothing.
 */
const canonical = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : null;
const redirectVercelHost = process.env.VERCEL_ENV === "production" && canonical !== null && !canonical.hostname.endsWith(".vercel.app");

export default clerkMiddleware(async (auth, request) => {
  // next.config.ts turns off Next.js's own trailing-slash redirect for PostHog,
  // so pages keep a single URL here instead: /pledge/ → /pledge. A plain URL,
  // because a cloned nextUrl remembers the slash and puts it back.
  const { pathname, search } = request.nextUrl;
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return NextResponse.redirect(new URL((pathname.replace(/\/+$/, "") || "/") + search, request.url), 308);
  }
  if (redirectVercelHost && canonical && request.nextUrl.hostname.endsWith(".vercel.app")) {
    const target = new URL(request.nextUrl.pathname + request.nextUrl.search, canonical);
    return NextResponse.redirect(target, 308);
  }
  if (isHostRoute(request)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals, the PostHog relay (next.config.ts) and static files,
    // unless found in search params.
    "/((?!_next|chai/|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
    // Always run for Clerk's Frontend API proxy. Production on *.vercel.app loads
    // clerk-js through /__clerk/npm/…/*.js, which the static-file rule above skips.
    "/__clerk/(.*)",
  ],
};

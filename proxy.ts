import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Host screens need a session. Ask pages, the landing page and /start stay public.
const isHostRoute = createRouteMatcher(["/inbox(.*)", "/settings(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isHostRoute(request)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};

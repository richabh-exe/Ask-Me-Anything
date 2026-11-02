import { waitUntil } from "@vercel/functions";
import type { Instrumentation } from "next";

/*
 * Server errors go to PostHog error tracking (lib/server/errors.ts), scrubbed
 * of any question or answer text first. React doesn't wait for this hook while
 * it renders, so waitUntil keeps the Vercel function alive until the report is
 * sent; awaiting it covers server actions and route handlers too.
 */
export const onRequestError: Instrumentation.onRequestError = async (error, _request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs" || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  const report = import("./lib/server/errors")
    .then(({ captureServerError }) => captureServerError(error, context))
    .catch(() => {});
  waitUntil(report);
  await report;
};

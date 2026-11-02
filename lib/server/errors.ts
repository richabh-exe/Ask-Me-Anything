import "server-only";
import { ErrorTracking } from "@posthog/core";
import type { Instrumentation } from "next";
import { scrubExceptionList } from "../error-scrub";
import { sendServerEvent } from "./analytics";

/*
 * Server errors (server actions, route handlers, rendering, the proxy), sent
 * to PostHog error tracking from instrumentation.ts. Each report goes out like
 * an asker event: a fresh random ID, no person, no request headers, cookies
 * or URL, only the route's file path. The exception passes through
 * lib/error-scrub.ts first, so a failed query's parameters (a question's
 * text) or a quoted input snippet never leave the server.
 */

type ErrorContext = Parameters<Instrumentation.onRequestError>[2];

const builder = new ErrorTracking.ErrorPropertiesBuilder(
  [new ErrorTracking.ErrorCoercer(), new ErrorTracking.ObjectCoercer(), new ErrorTracking.StringCoercer(), new ErrorTracking.PrimitiveCoercer()],
  ErrorTracking.createStackParser("node:javascript", ErrorTracking.nodeStackLineParser),
);

/** The properties of a server $exception event, scrubbed and ready to send. */
export function serverExceptionProperties(error: unknown, context: ErrorContext): Record<string, unknown> {
  const { $exception_list } = builder.buildFromUnknown(error, { mechanism: { handled: false } });
  // React tags server errors with a digest, which the error page shows: it ties a user's report to this event.
  const digest = typeof error === "object" && error !== null && "digest" in error ? String(error.digest) : "";
  return {
    $exception_list: scrubExceptionList($exception_list),
    $exception_level: "error",
    route: context.routePath,
    route_type: context.routeType,
    render_source: context.renderSource,
    ...(/^[\w-]{1,64}$/.test(digest) ? { digest } : {}),
  };
}

export async function captureServerError(error: unknown, context: ErrorContext): Promise<void> {
  try {
    await sendServerEvent("$exception", serverExceptionProperties(error, context));
  } catch {
    /* Reporting an error must never cause another. */
  }
}

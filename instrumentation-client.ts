import { reportEarlyError } from "./lib/analytics";

/*
 * Runs before the app hydrates. PostHog loads later, once the page is idle
 * (lib/analytics.ts), so errors thrown before then, such as a hydration
 * mismatch or a crash on first render, are held and sent when it arrives.
 * After that PostHog catches errors itself and these listeners do nothing.
 */
window.addEventListener("error", (event) => reportEarlyError(event.error ?? event));
window.addEventListener("unhandledrejection", (event) => reportEarlyError(event.reason));

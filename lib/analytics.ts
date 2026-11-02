import type { PostHog } from "posthog-js";
import type { TemplateId } from "./types";

/*
 * Product analytics (PostHog), loaded only when NEXT_PUBLIC_POSTHOG_KEY is set.
 *
 * Anonymity comes first (playbook: "Protect anonymity in analytics"):
 * - Hosts are identified by their Clerk user ID only after they sign in.
 *   Askers are never identified, and the asker-side events (question_sent,
 *   question_filtered) are captured on the server with a throwaway ID, so they
 *   can't be tied to any browser or person. See lib/server/analytics.ts.
 * - No question or answer text is ever a property.
 * - Autocapture, session replay, heatmaps and surveys are off everywhere, so
 *   nothing on screen (questions in the inbox included) can leak into events.
 * - The anonymous ID lives in sessionStorage: it survives the Google sign-in
 *   redirect, so the signup funnel holds together, then disappears with the tab.
 * - Uncaught errors go to PostHog error tracking, but every report passes
 *   through lib/error-scrub.ts first, which cuts out anything that could be
 *   someone's text: messages lose quoted strings and everything past the
 *   first line, and URLs lose their query strings.
 *
 * Events go to /chai on our own domain, which next.config.ts rewrites to
 * PostHog. The data is the same; tracking blockers just don't drop it.
 */

export type ShareChannel = "share_sheet" | "download" | "copy";

interface Events {
  signup_started: { step: "account" };
  signup_completed: { method: "google" | "email" };
  link_shared: { channel: ShareChannel };
  answer_published: { template: TemplateId; public: boolean };
  card_shared: { channel: ShareChannel; template: TemplateId };
  /** The viral loop: an asker taps "Get your own link". */
  ask_page_cta_clicked: { placement: "after_send" | "unclaimed" | "sample" };
  pwa_installed: Record<string, never>;
}

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
// The PostHog app itself (us.posthog.com), for the links the SDK builds.
const UI_HOST = (process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com").replace(".i.posthog.com", ".posthog.com");

let client: Promise<PostHog | null> | undefined;
// Errors thrown before PostHog has loaded (instrumentation-client.ts), sent once it has.
let early: unknown[] | null = [];

function posthog(): Promise<PostHog | null> {
  if (!KEY || typeof window === "undefined") return Promise.resolve(null);
  client ??= Promise.all([
    import("posthog-js"),
    // The SDK fetches its error hooks from PostHog's CDN, which external loading
    // (off below) forbids. Bundling them makes exception capture work anyway.
    import("posthog-js/dist/exception-autocapture"),
    import("./error-scrub"),
  ])
    .then(([{ default: ph }, , { scrubExceptionEvent }]) => {
      ph.init(KEY, {
        api_host: "/chai",
        ui_host: UI_HOST,
        defaults: "2026-08-30",
        person_profiles: "identified_only",
        persistence: "sessionStorage",
        capture_pageview: "history_change",
        capture_pageleave: true,
        autocapture: false,
        rageclick: false,
        capture_dead_clicks: false,
        enable_heatmaps: false,
        disable_session_recording: true,
        disable_surveys: true,
        disable_product_tours: true,
        disable_conversations: true,
        disable_web_experiments: true,
        disable_external_dependency_loading: true,
        mask_all_text: true,
        // console.error is left alone: libraries log whatever they like there.
        capture_exceptions: { capture_unhandled_errors: true, capture_unhandled_rejections: true, capture_console_errors: false },
        error_tracking: { exception_steps: { enabled: false } },
        before_send: (event) => {
          if (event?.event !== "$exception") return event;
          // An error report never updates a person profile.
          return { uuid: event.uuid, event: event.event, timestamp: event.timestamp, properties: scrubExceptionEvent(event.properties) };
        },
      });
      for (const error of early ?? []) ph.captureException(error);
      early = null;
      return ph;
    })
    .catch(() => null);
  return client;
}

/** Holds an error thrown before PostHog started, and starts it, so a crash on first paint is still reported. */
export function reportEarlyError(error: unknown) {
  if (!KEY || !early || early.length >= 10) return;
  early.push(error);
  void posthog();
}

/** Starts PostHog after the page is idle, so it never competes with first paint. */
export function startAnalytics() {
  if (!KEY) return;
  const start = () => void posthog();
  if ("requestIdleCallback" in window) window.requestIdleCallback(start, { timeout: 4000 });
  else setTimeout(start, 1500);
}

export function track<E extends keyof Events>(event: E, properties: Events[E]) {
  void posthog().then((ph) => ph?.capture(event, properties));
}

/** Hosts only. Never call this for someone asking a question. */
export function identifyHost(userId: string) {
  void posthog().then((ph) => {
    if (ph && ph.get_distinct_id() !== userId) ph.identify(userId);
  });
}

export function forgetHost() {
  void posthog().then((ph) => ph?.reset());
}

export function shareChannel(outcome: "shared" | "saved" | "cancelled" | "failed"): ShareChannel | null {
  return outcome === "shared" ? "share_sheet" : outcome === "saved" ? "download" : null;
}

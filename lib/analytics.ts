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
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let client: Promise<PostHog | null> | undefined;

function posthog(): Promise<PostHog | null> {
  if (!KEY || typeof window === "undefined") return Promise.resolve(null);
  client ??= import("posthog-js")
    .then(({ default: ph }) => {
      ph.init(KEY, {
        api_host: HOST,
        defaults: "2026-01-30",
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
      });
      return ph;
    })
    .catch(() => null);
  return client;
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

"use client";

import { useCallback, useEffect, useState } from "react";
import type { InboxData } from "@/lib/types";

type State =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "error"; message: string }
  | { status: "ready"; data: InboxData };

const POLL_MS = 8_000;

/*
 * The host's profile and questions from /api/inbox. Polls while the tab is
 * visible and refetches on focus, so new questions drop in without a reload.
 * `update` applies an optimistic change while a server action runs.
 */
export function useInbox({ poll = true }: { poll?: boolean } = {}) {
  const [state, setState] = useState<State>({ status: "loading" });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/inbox", { cache: "no-store" });
      if (res.status === 401) return setState({ status: "signed-out" });
      if (!res.ok) throw new Error(`The inbox didn't load (error ${res.status}).`);
      const data = (await res.json()) as InboxData;
      setState({ status: "ready", data });
    } catch (error) {
      setState((current) =>
        current.status === "ready"
          ? current // keep showing what we have; the next poll will retry
          : { status: "error", message: error instanceof Error ? error.message : "The inbox didn't load." },
      );
    }
  }, []);

  useEffect(() => {
    void refresh();
    if (!poll) return;
    const tick = () => document.visibilityState === "visible" && void refresh();
    const id = window.setInterval(tick, POLL_MS);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", tick);
    };
  }, [refresh, poll]);

  const update = useCallback((change: (data: InboxData) => InboxData) => {
    setState((current) => (current.status === "ready" ? { status: "ready", data: change(current.data) } : current));
  }, []);

  return { state, refresh, update };
}

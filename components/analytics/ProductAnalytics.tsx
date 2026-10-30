"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { forgetHost, identifyHost, startAnalytics, track } from "@/lib/analytics";

/** Starts PostHog, ties signed-in hosts to their user ID, and notes PWA installs. Renders nothing. */
export function ProductAnalytics() {
  const { isLoaded, userId } = useAuth();
  const knownHost = useRef<string | null>(null);

  useEffect(() => {
    startAnalytics();
    const onInstall = () => track("pwa_installed", {});
    window.addEventListener("appinstalled", onInstall);
    return () => window.removeEventListener("appinstalled", onInstall);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (userId) {
      knownHost.current = userId;
      identifyHost(userId);
    } else if (knownHost.current) {
      knownHost.current = null;
      forgetHost();
    }
  }, [isLoaded, userId]);

  return null;
}

"use client";

import { useSyncExternalStore } from "react";
import { displayHost, serverOrigin } from "@/lib/site";

const subscribe = () => () => {};

/**
 * displayHost() for server-rendered text. Hydration reuses the host the server
 * rendered; without NEXT_PUBLIC_SITE_URL (previews, local dev) the text then
 * switches to the browser's own host.
 */
export function useSiteHost(): string {
  return useSyncExternalStore(subscribe, () => displayHost(), () => displayHost(serverOrigin()));
}

import { useSyncExternalStore } from "react";
import type { DB } from "./types";

/*
 * Demo persistence: one JSON document in localStorage, shared across tabs
 * through the `storage` event so a question asked in one tab drops into the
 * inbox open in another. Everything above this file talks to `readDB` and
 * `writeDB` only, so swapping in Supabase means replacing this module.
 */

export const STORAGE_KEY = "poocho:v1";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function memoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

const EMPTY: DB = Object.freeze({ version: 1, profile: null, questions: [], sent: {} }) as DB;

let storage: StorageLike | null = null;
let cachedRaw: string | null | undefined;
let cachedDB: DB = EMPTY;
const listeners = new Set<() => void>();

function getStorage(): StorageLike {
  if (storage) return storage;
  try {
    const probe = "__poocho_probe__";
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    storage = window.localStorage;
  } catch {
    // Private mode or blocked storage: keep working for this visit only.
    storage = memoryStorage();
  }
  return storage;
}

/** Used by tests to run actions without a browser. */
export function setStorage(next: StorageLike) {
  storage = next;
  cachedRaw = undefined;
  cachedDB = EMPTY;
}

function parse(raw: string | null): DB {
  if (!raw) return EMPTY;
  try {
    const data = JSON.parse(raw) as Partial<DB>;
    if (data.version !== 1) return EMPTY;
    return {
      version: 1,
      profile: data.profile ?? null,
      questions: Array.isArray(data.questions) ? data.questions : [],
      sent: data.sent ?? {},
    };
  } catch {
    return EMPTY;
  }
}

export function readDB(): DB {
  let raw: string | null = null;
  try {
    raw = getStorage().getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw === cachedRaw) return cachedDB;
  cachedRaw = raw;
  cachedDB = parse(raw);
  return cachedDB;
}

export function writeDB(update: (db: DB) => DB): DB {
  const next = update(readDB());
  const raw = JSON.stringify(next);
  try {
    getStorage().setItem(STORAGE_KEY, raw);
  } catch {
    // Quota exceeded: keep the in-memory copy so the session still works.
  }
  cachedRaw = raw;
  cachedDB = next;
  listeners.forEach((fn) => fn());
  return next;
}

export function clearDB() {
  try {
    getStorage().removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
  cachedRaw = null;
  cachedDB = EMPTY;
  listeners.forEach((fn) => fn());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const serverSnapshot = () => null;

/** The current DB, or `null` during server render and hydration. */
export function useDB(): DB | null {
  return useSyncExternalStore(subscribe, readDB, serverSnapshot);
}

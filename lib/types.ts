export type LinkMode = "anonymous" | "named" | "choice";
export type FilterLevel = "relaxed" | "standard" | "strict";
export type QuestionStatus = "new" | "answered" | "filtered";
export type TemplateId = "notebook" | "ink" | "haldi" | "margin" | "chalk";

export type ModerationCategory =
  | "harassment"
  | "profanity"
  | "sexual"
  | "threat"
  | "self_harm"
  | "personal_info"
  | "blocked_word"
  | "shouting";

export interface ModerationResult {
  /** 0–1, combined with a noisy-OR across every matched signal. */
  score: number;
  categories: ModerationCategory[];
  flagged: boolean;
  /** True when the text suggests the writer may be at risk. */
  supportCard: boolean;
}

export interface Profile {
  handle: string;
  displayName: string;
  prompt: string;
  mode: LinkMode;
  filterLevel: FilterLevel;
  blockedWords: string[];
  paused: boolean;
  createdAt: number;
  /** We keep only the fact that an 18+ check passed, never the date of birth. */
  ageConfirmedAt: number;
}

export interface Answer {
  body: string;
  template: TemplateId;
  isPublic: boolean;
  answeredAt: number;
}

export interface Question {
  id: string;
  handle: string;
  body: string;
  createdAt: number;
  status: QuestionStatus;
  /** Only present when the asker chose (or the link required) a visible name. */
  askerName?: string;
  moderation: ModerationResult;
  answer?: Answer;
}

export interface DB {
  version: 1;
  profile: Profile | null;
  questions: Question[];
  /** Send timestamps per handle, for this device's rate limit. */
  sent: Record<string, number[]>;
}

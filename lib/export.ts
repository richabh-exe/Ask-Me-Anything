import type { DB } from "./types";

/** PRD US-7: everything a host owns, as JSON and as CSV. */
export function exportJSON(db: DB): Blob {
  const { profile, questions } = db;
  return new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), profile, questions }, null, 2)], {
    type: "application/json",
  });
}

function cell(value: unknown): string {
  const text = value === undefined || value === null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function exportCSV(db: DB): Blob {
  const header = ["id", "asked_at", "status", "question", "asker_name", "answer", "answered_at", "public", "filter_reasons"];
  const rows = db.questions.map((q) => [
    q.id,
    new Date(q.createdAt).toISOString(),
    q.status,
    q.body,
    q.askerName ?? "",
    q.answer?.body ?? "",
    q.answer ? new Date(q.answer.answeredAt).toISOString() : "",
    q.answer ? String(q.answer.isPublic) : "",
    q.moderation.categories.join(" "),
  ]);
  const csv = [header, ...rows].map((row) => row.map(cell).join(",")).join("\n");
  return new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
}

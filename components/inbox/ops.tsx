"use client";

import { createContext, useContext, useMemo } from "react";
import {
  answerQuestionAction,
  deleteQuestionAction,
  moveQuestionAction,
  setAnswerPublicAction,
  updateProfileAction,
} from "@/app/actions";
import { useToast } from "@/components/ui/Toast";
import type { Answer, InboxData, Profile, Question } from "@/lib/types";

type ProfilePatch = Parameters<typeof updateProfileAction>[0];

export interface InboxOps {
  answer: (id: string, answer: Omit<Answer, "answeredAt">) => Promise<boolean>;
  setPublic: (id: string, isPublic: boolean) => Promise<void>;
  move: (id: string, status: "new" | "filtered") => Promise<void>;
  remove: (id: string) => Promise<void>;
  patchProfile: (patch: ProfilePatch) => Promise<void>;
}

const OpsContext = createContext<InboxOps | null>(null);

const withQuestion = (id: string, change: (q: Question) => Question) => (data: InboxData): InboxData => ({
  ...data,
  questions: data.questions.map((q) => (q.id === id ? change(q) : q)),
});

/*
 * Every inbox change is applied on screen first, sent as a server action,
 * then reconciled with a fresh fetch. If the server refuses, the refetch puts
 * the screen back and a toast says what happened.
 */
export function useCreateInboxOps(update: (change: (d: InboxData) => InboxData) => void, refresh: () => Promise<void>): InboxOps {
  const toast = useToast();
  return useMemo(() => {
    async function run<T>(optimistic: (d: InboxData) => InboxData, action: () => Promise<T>): Promise<T | undefined> {
      update(optimistic);
      try {
        return await action();
      } catch {
        toast("That change didn't save. Check your connection and try again.", "warn");
        return undefined;
      } finally {
        await refresh();
      }
    }

    return {
      answer: async (id, answer) =>
        (await run(
          withQuestion(id, (q) => ({ ...q, status: "answered", answer: { ...answer, answeredAt: q.answer?.answeredAt ?? Date.now() } })),
          () => answerQuestionAction(id, answer),
        )) === true,
      setPublic: async (id, isPublic) => {
        await run(
          withQuestion(id, (q) => (q.answer ? { ...q, answer: { ...q.answer, isPublic } } : q)),
          () => setAnswerPublicAction(id, isPublic),
        );
      },
      move: async (id, status) => {
        await run(
          withQuestion(id, (q) => ({ ...q, status, answer: status === "filtered" ? undefined : q.answer })),
          () => moveQuestionAction(id, status),
        );
      },
      remove: async (id) => {
        await run((d) => ({ ...d, questions: d.questions.filter((q) => q.id !== id) }), () => deleteQuestionAction(id));
      },
      patchProfile: async (patch) => {
        await run(
          (d) => (d.profile ? { ...d, profile: { ...d.profile, ...patch } as Profile } : d),
          () => updateProfileAction(patch),
        );
      },
    };
  }, [update, refresh, toast]);
}

export function InboxOpsProvider({ ops, children }: { ops: InboxOps; children: React.ReactNode }) {
  return <OpsContext.Provider value={ops}>{children}</OpsContext.Provider>;
}

export function useInboxOps(): InboxOps {
  const ops = useContext(OpsContext);
  if (!ops) throw new Error("useInboxOps must be used inside <InboxOpsProvider>");
  return ops;
}

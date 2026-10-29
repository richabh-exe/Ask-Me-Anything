import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AskPage, AskShell, type AskView } from "@/components/ask/AskPage";
import { cleanHandle } from "@/lib/handle";
import { SAMPLE_ANSWERS, SAMPLE_PROFILE } from "@/lib/sample";
import { getDb } from "@/lib/server/db";
import { getProfileByHandle, publicAnswers, toPublicProfile } from "@/lib/server/repo";

export async function generateMetadata({ params }: PageProps<"/u/[handle]">): Promise<Metadata> {
  const handle = cleanHandle(decodeURIComponent((await params).handle));
  return {
    title: `Ask @${handle} anything`,
    description: `Send @${handle} an anonymous question on Poocho. Every question is from a real person and filtered for abuse.`,
    // Indexing waits for the SEO gate in PRD §12 (host-approved, substantive answers only).
    robots: { index: false, follow: true },
  };
}

export default function Page({ params }: PageProps<"/u/[handle]">) {
  return (
    <Suspense
      fallback={
        <AskShell>
          <div className="h-[520px] animate-pulse rounded-[6px] bg-white/15" />
        </AskShell>
      }
    >
      <AskRoute params={params} />
    </Suspense>
  );
}

async function AskRoute({ params }: { params: PageProps<"/u/[handle]">["params"] }) {
  const handle = cleanHandle(decodeURIComponent((await params).handle));
  return <AskPage view={await loadView(handle)} />;
}

async function loadView(handle: string): Promise<AskView> {
  if (handle === SAMPLE_PROFILE.handle) return { kind: "sample", profile: SAMPLE_PROFILE, answers: SAMPLE_ANSWERS };

  const db = getDb();
  const host = await getProfileByHandle(db, handle);
  if (!host) return { kind: "unclaimed", handle };

  const [answers, { userId }] = await Promise.all([publicAnswers(db, host.id, host.profile.handle), auth()]);
  // Only public fields reach the browser: no filter level, blocked words or IDs.
  return { kind: "live", profile: toPublicProfile(host.profile), answers, own: userId === host.id };
}

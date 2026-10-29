import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { cache, Suspense } from "react";
import { AskPage, AskShell, type AskView } from "@/components/ask/AskPage";
import { cleanHandle } from "@/lib/handle";
import { pageMetadata } from "@/lib/metadata";
import { SAMPLE_ANSWERS, SAMPLE_PROFILE } from "@/lib/sample";
import { absoluteUrl, isProfileIndexable, jsonLd } from "@/lib/seo";
import { getDb } from "@/lib/server/db";
import { countSubstantiveAnswers, getProfileByHandle, publicAnswers, toPublicProfile } from "@/lib/server/repo";
import { askPath } from "@/lib/site";
import type { PublicProfile } from "@/lib/types";

/** One lookup per request, shared by the metadata and the page. */
const findHost = cache((handle: string) => getProfileByHandle(getDb(), handle));

/*
 * Ask pages are indexed only once they pass the PRD §12 gate (three public,
 * substantive answers on a week-old account); until then they are
 * noindex,follow. /@demo is always noindex because the team wrote it.
 */
export async function generateMetadata({ params }: PageProps<"/u/[handle]">): Promise<Metadata> {
  const handle = cleanHandle(decodeURIComponent((await params).handle));
  const path = askPath(handle);
  const fallback = `Send @${handle} an anonymous question on Poocho. Every question is from a real person and filtered for abuse.`;

  if (handle === SAMPLE_PROFILE.handle) {
    return pageMetadata({ title: `Ask @${handle} anything`, description: fallback, path, noindex: true });
  }

  const host = await findHost(handle);
  if (!host) return pageMetadata({ title: `Claim @${handle}`, description: fallback, path, noindex: true });

  const { profile } = host;
  const substantiveAnswers = await countSubstantiveAnswers(getDb(), host.id);
  return pageMetadata({
    title: `Ask @${handle} anything`,
    description: `“${profile.prompt}” Send ${profile.displayName} (@${handle}) an anonymous question on Poocho. Real people only, filtered for abuse.`,
    path,
    noindex: !isProfileIndexable({ createdAt: profile.createdAt, paused: profile.paused, substantiveAnswers }),
  });
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
  const view = await loadView(handle);
  return (
    <>
      {view.kind === "live" && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(profileGraph(view.profile)) }} />}
      <AskPage view={view} />
    </>
  );
}

/** ProfilePage + Person, as Google documents for creator profiles. No QAPage: only the host answers. */
function profileGraph(profile: PublicProfile) {
  const url = absoluteUrl(askPath(profile.handle));
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    mainEntity: {
      "@type": "Person",
      name: profile.displayName,
      alternateName: `@${profile.handle}`,
      identifier: profile.handle,
      url,
      description: profile.prompt,
    },
  };
}

async function loadView(handle: string): Promise<AskView> {
  if (handle === SAMPLE_PROFILE.handle) return { kind: "sample", profile: SAMPLE_PROFILE, answers: SAMPLE_ANSWERS };

  const host = await findHost(handle);
  if (!host) return { kind: "unclaimed", handle };

  const [answers, { userId }] = await Promise.all([publicAnswers(getDb(), host.id, host.profile.handle), auth()]);
  // Only public fields reach the browser: no filter level, blocked words or IDs.
  return { kind: "live", profile: toPublicProfile(host.profile), answers, own: userId === host.id };
}

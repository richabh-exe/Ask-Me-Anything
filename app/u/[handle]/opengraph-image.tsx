import { cacheLife } from "next/cache";
import { cleanHandle } from "@/lib/handle";
import { homeImage, OG_SIZE, profileImage } from "@/lib/og/render";
import { SAMPLE_ANSWERS, SAMPLE_PROFILE } from "@/lib/sample";
import { getDb } from "@/lib/server/db";
import { getProfileByHandle, publicAnswers } from "@/lib/server/repo";
import { displayHost, serverOrigin } from "@/lib/site";

export const alt = "Ask me anything on Poocho";
export const size = OG_SIZE;
export const contentType = "image/png";

/*
 * The preview WhatsApp and Instagram DMs show for /@handle: the handle, the
 * prompt and the latest public answer. Unclaimed handles get the plain brand
 * image, so nobody can print arbitrary text on a Poocho card via the URL.
 */
export default async function Image({ params }: { params: Promise<{ handle: string }> }) {
  const handle = cleanHandle(decodeURIComponent((await params).handle));
  const host = displayHost(serverOrigin());
  const card = await loadCard(handle);
  return card ? profileImage({ handle, host, ...card }) : homeImage(host);
}

async function loadCard(handle: string): Promise<{ prompt: string; latest?: { question: string; answer: string } } | null> {
  "use cache";
  cacheLife("hours");
  if (handle === SAMPLE_PROFILE.handle) {
    const [first] = SAMPLE_ANSWERS;
    return { prompt: SAMPLE_PROFILE.prompt, latest: first?.answer ? { question: first.body, answer: first.answer.body } : undefined };
  }
  const db = getDb();
  const host = await getProfileByHandle(db, handle);
  if (!host) return null;
  const [latest] = await publicAnswers(db, host.id, handle, 1);
  return {
    prompt: host.profile.prompt,
    latest: latest?.answer ? { question: latest.body, answer: latest.answer.body } : undefined,
  };
}

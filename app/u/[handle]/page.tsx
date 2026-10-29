import type { Metadata } from "next";
import { AskPage } from "@/components/ask/AskPage";
import { cleanHandle } from "@/lib/handle";

export async function generateStaticParams() {
  return [{ handle: "demo" }];
}

export async function generateMetadata({ params }: PageProps<"/u/[handle]">): Promise<Metadata> {
  const handle = cleanHandle(decodeURIComponent((await params).handle));
  return {
    title: `Ask @${handle} anything`,
    description: `Send @${handle} an anonymous question on Poocho. Every question is from a real person and filtered for abuse.`,
    // Pages are rendered from this browser's data for now, so keep them out of search.
    robots: { index: false, follow: true },
  };
}

export default async function Page({ params }: PageProps<"/u/[handle]">) {
  const handle = cleanHandle(decodeURIComponent((await params).handle));
  return <AskPage handle={handle} />;
}

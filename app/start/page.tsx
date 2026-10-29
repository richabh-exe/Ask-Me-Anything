import type { Metadata } from "next";
import { Suspense } from "react";
import { StartFlow } from "@/components/start/StartFlow";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { SiteNav } from "@/components/ui/SiteNav";

export const metadata: Metadata = {
  title: "Get your link",
  robots: { index: false },
};

export default function StartPage() {
  return (
    <main id="main" className="on-paper flex-1 bg-paper-dim pb-20">
      <SiteNav tone="paper" />
      <div className="mx-auto max-w-[640px] px-4 pt-4 sm:pt-8">
        <DemoNotice />
        <Suspense fallback={<div className="h-[420px] animate-pulse rounded-[8px] bg-white/70" />}>
          <StartFlow />
        </Suspense>
      </div>
    </main>
  );
}

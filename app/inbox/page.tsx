import type { Metadata } from "next";
import { InboxPage } from "@/components/inbox/InboxPage";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { SiteNav } from "@/components/ui/SiteNav";

export const metadata: Metadata = {
  title: "Inbox",
  robots: { index: false },
};

export default function Inbox() {
  return (
    <main id="main" className="on-paper flex-1 bg-paper-dim pb-24">
      <SiteNav tone="paper" />
      <div className="mx-auto max-w-[1100px] px-4 pt-4 sm:px-8 sm:pt-6">
        <DemoNotice />
        <InboxPage />
      </div>
    </main>
  );
}

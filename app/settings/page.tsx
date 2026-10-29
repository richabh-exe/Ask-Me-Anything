import type { Metadata } from "next";
import { SettingsPage } from "@/components/settings/SettingsPage";
import { SiteNav } from "@/components/ui/SiteNav";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false },
};

export default function Settings() {
  return (
    <main id="main" className="on-paper flex-1 bg-paper-dim pb-24">
      <SiteNav tone="paper" />
      <div className="mx-auto max-w-[720px] px-4 pt-4 sm:pt-8">
        <SettingsPage />
      </div>
    </main>
  );
}

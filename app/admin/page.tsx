import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LinkBuilder } from "@/components/admin/LinkBuilder";
import { SiteNav } from "@/components/ui/SiteNav";
import { getDb } from "@/lib/server/db";
import { adminStats } from "@/lib/server/repo";

export const metadata: Metadata = { title: "Numbers", robots: { index: false, follow: false } };

/*
 * The Monday review in one place (playbook: Monitoring, "User counts"). Only
 * Clerk users listed in ADMIN_USER_IDS can open it; everyone else gets a 404.
 */
export default function AdminPage() {
  return (
    <Suspense fallback={<main id="main" className="desk flex-1" />}>
      <Admin />
    </Suspense>
  );
}

async function Admin() {
  const { userId } = await auth();
  const admins = (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!userId || !admins.includes(userId)) notFound();

  return (
    <main id="main" className="flex-1">
      <section className="desk pb-14 text-white">
        <SiteNav tone="ink" />
        <div className="mx-auto max-w-[1100px] px-4 pt-6 sm:px-8">
          <h1 className="text-[clamp(2.2rem,5vw,3.4rem)] leading-none font-extrabold tracking-[-0.03em] stretch-wide">This week</h1>
          <p className="mt-3 text-white/80">Live from the database. Write these into the KPI table every Monday.</p>
        </div>
      </section>
      <div className="on-paper bg-paper pb-20">
        <div className="mx-auto -mt-8 max-w-[1100px] px-4 sm:px-8">
          <Numbers />
          <section aria-labelledby="links" className="mt-10 rounded-[20px] border-2 border-navy bg-white p-6 sm:p-8">
            <h2 id="links" className="text-[1.6rem] font-extrabold stretch-wide">
              Tagged links
            </h2>
            <p className="mt-1 mb-5 text-navy-soft">Every link you share should carry UTM tags so Vercel Analytics and PostHog show which channel worked.</p>
            <LinkBuilder />
          </section>
        </div>
      </div>
    </main>
  );
}

async function Numbers() {
  const s = await adminStats(getDb());
  const tiles: { label: string; value: string; note: string; target?: string }[] = [
    { label: "Weekly shared answers", value: String(s.weeklyAnswers), note: "Answers published in the last 7 days. The north star.", target: "300 by day 30" },
    { label: "Total hosts", value: String(s.totalHosts), note: `${s.newToday} today, ${s.newThisWeek} this week`, target: "300 by day 30" },
    { label: "Activation", value: `${s.activationPct}%`, note: "New hosts with a real question within 48 hours", target: "50%" },
    {
      label: "Weekly active hosts",
      value: String(s.weeklyActiveHosts),
      note: s.totalHosts ? `${Math.round((100 * s.weeklyActiveHosts) / s.totalHosts)}% of hosts answered this week` : "Hosts who answered this week",
      target: "30% of hosts",
    },
    { label: "Questions this week", value: String(s.questionsThisWeek), note: `${s.filteredPct}% filtered as abusive. Look closer above 15%.` },
    { label: "Indexable profiles", value: String(s.indexableProfiles), note: "Ask pages that pass the indexing gate and sit in the sitemap" },
  ];

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tiles.map((t) => (
        <li key={t.label} className="rounded-[20px] border-2 border-navy bg-white p-6 shadow-[0_4px_0_var(--color-navy)]">
          <p className="font-semibold text-navy-soft">{t.label}</p>
          <p className="mt-1 text-[3rem] leading-none font-extrabold tracking-[-0.03em] text-ink stretch-wide">{t.value}</p>
          <p className="mt-3 text-[0.95rem] leading-snug text-navy-soft">{t.note}</p>
          {t.target && <p className="mt-2 font-hand text-[1.05rem] font-bold text-margin-deep">Target: {t.target}</p>}
        </li>
      ))}
    </ul>
  );
}

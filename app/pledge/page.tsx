import type { Metadata } from "next";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { SiteNav } from "@/components/ui/SiteNav";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "The Real Questions Pledge",
  description:
    "Poocho never sends fake questions, never sells hints about who asked, filters abuse before you see it, and is for adults only.",
  path: "/pledge",
});

const PROMISES = [
  {
    title: "Every question is from a real person",
    body: "No code path in Poocho puts a computer-written question in your inbox. Prompt ideas we suggest are shown separately and always labelled “From Poocho”. An automated test checks this on every change.",
  },
  {
    title: "We never sell who asked",
    body: "There are no hints, clues, reveals or paid “who sent this” features, and there never will be. No paid feature touches anonymity.",
  },
  {
    title: "Cruel questions are filtered first",
    body: "Questions are checked before delivery. Insults, swearing, sexual messages, threats and personal details go to a Filtered folder you can choose to open. You set how strict the filter is, and you can block your own words. No filter is perfect, and we won't pretend ours is.",
  },
  {
    title: "Adults only",
    body: "Hosts and askers must be 18 or older. We don't market to teenagers, and accounts that show signs of belonging to someone under 18 are closed and their data deleted.",
  },
  {
    title: "Your answers are yours",
    body: "Export everything as JSON or CSV at any time, or delete your account and all its questions.",
  },
];

const RETENTION = [
  ["Questions and answers", "Until you delete them, or 30 days after you delete your account"],
  ["Filtered questions", "30 days, unless reported"],
  ["Technical abuse logs (IP, device)", "30 days, rolling. Never shown to hosts"],
  ["Reports and enforcement records", "1 year"],
];

export default function PledgePage() {
  return (
    <>
      <main id="main" className="flex-1">
        <section className="desk pb-24">
          <SiteNav tone="ink" />
          <div className="mx-auto max-w-[860px] px-4 pt-6 sm:px-8">
            <div className="paper-shadow">
              <article className="torn margin-line on-paper rounded-[4px] bg-white px-6 pt-14 pb-12 text-navy [--margin-x:1.8rem] sm:px-12 sm:[--margin-x:3rem]">
                <div className="pl-6 sm:pl-8">
                  <h1 className="text-[clamp(2.2rem,6vw,3.8rem)] leading-[1.02] font-extrabold tracking-[-0.03em] stretch-wide">
                    The Real Questions Pledge
                  </h1>
                  <p className="mt-6 max-w-[60ch] text-[1.15rem] leading-relaxed text-navy-soft">
                    In 2024 the FTC acted against the most popular anonymous question app for sending users fake questions and
                    selling “hints” about who sent them. Poocho is built on the opposite promise, written down here so you can
                    hold us to it.
                  </p>

                  <ol className="mt-12 grid gap-9">
                    {PROMISES.map((p, i) => (
                      <li key={p.title} className="grid grid-cols-[2.5rem_1fr] gap-3">
                        <span aria-hidden="true" className="font-hand text-[2rem] leading-none font-bold text-ink">
                          {i + 1}
                        </span>
                        <div>
                          <h2 className="text-[1.35rem] leading-tight font-bold stretch-semi">{p.title}</h2>
                          <p className="mt-2 max-w-[62ch] leading-relaxed">{p.body}</p>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <p className="mt-12 font-hand text-[2.2rem] leading-none font-bold text-ink">Team Poocho</p>

                  <h2 id="anonymity" className="mt-20 scroll-mt-8 text-[1.9rem] font-extrabold tracking-[-0.02em] stretch-wide">
                    How anonymity works
                  </h2>
                  <div className="mt-4 grid max-w-[64ch] gap-4 leading-relaxed">
                    <p>
                      Each link has a mode. <strong>Anonymous</strong> links show the host only the question and when it was sent.{" "}
                      <strong>Named</strong> links require a name, and askers are told it will be shown.{" "}
                      <strong>Asker&apos;s choice</strong> links are anonymous unless the asker chooses to show their name.
                    </p>
                    <p>
                      Hosts never see your IP address, device, location or any “hint”. To stop abuse, Poocho keeps limited technical
                      data in an access-controlled log for 30 days. In plain words: you are anonymous to the host, not to the law. If
                      we receive a valid legal order, or a report of a serious threat, our Trust and Safety team can act on it.
                    </p>
                  </div>

                  <h2 id="analytics" className="mt-14 scroll-mt-8 text-[1.4rem] font-bold stretch-semi">
                    What we measure
                  </h2>
                  <div className="mt-3 grid max-w-[64ch] gap-4 leading-relaxed">
                    <p>We count how Poocho is used so we can make it better, never who asked what.</p>
                    <ul className="grid list-disc gap-2 pl-5 marker:text-margin">
                      <li>
                        <strong>Vercel Web Analytics and Speed Insights</strong> count page visits, where they came from and how fast pages
                        load. They use no cookies.
                      </li>
                      <li>
                        <strong>PostHog</strong> records a few product events, such as a link being shared or an answer being published.
                        Hosts are linked to their account ID after they sign up. People asking questions are never identified: those events
                        are sent from our server with a random ID, and no question or answer text is ever included. Session recording is
                        off.
                      </li>
                    </ul>
                    <p>There are no advertising trackers or pixels anywhere on Poocho, and we don&apos;t sell data.</p>
                  </div>

                  <h2 className="mt-14 text-[1.4rem] font-bold stretch-semi">How long we keep things</h2>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[480px] border-collapse text-left">
                      <thead>
                        <tr className="border-b-2 border-navy">
                          <th scope="col" className="py-2 pr-4 font-semibold">
                            Data
                          </th>
                          <th scope="col" className="py-2 font-semibold">
                            Kept for
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {RETENTION.map(([what, how]) => (
                          <tr key={what} className="border-b border-rule">
                            <td className="py-3 pr-4 align-top font-medium">{what}</td>
                            <td className="py-3 align-top text-navy-soft">{how}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h2 id="guidelines" className="mt-20 scroll-mt-8 text-[1.9rem] font-extrabold tracking-[-0.02em] stretch-wide">
                    Community guidelines
                  </h2>
                  <ul className="mt-4 grid max-w-[64ch] list-disc gap-3 pl-5 leading-relaxed marker:text-margin">
                    <li>Ask what you&apos;d be fine with the host reading out loud. Honest is welcome; cruel is not.</li>
                    <li>No threats, harassment, hate, sexual messages or pressure of any kind.</li>
                    <li>Don&apos;t share anyone&apos;s phone number, address or other personal details, including your own.</li>
                    <li>Don&apos;t try to work out who asked something, or ask others to.</li>
                    <li>You must be 18 or older to ask or host.</li>
                  </ul>
                  <p className="mt-5 max-w-[64ch] leading-relaxed">
                    Every public answer has a report option, and we aim to act on reports within 24 hours. Hosts can block words,
                    pause their inbox and delete anything at any time.
                  </p>

                  <h2 className="mt-14 text-[1.4rem] font-bold stretch-semi">If you need support</h2>
                  <p className="mt-3 max-w-[64ch] leading-relaxed">
                    If a question or anything else has left you struggling, you don&apos;t have to deal with it alone. In India,
                    Tele-MANAS offers free and confidential mental health support day and night: call <strong>14416</strong>.
                  </p>

                  <h2 className="mt-14 text-[1.4rem] font-bold stretch-semi">Grievance Officer</h2>
                  <p className="mt-3 max-w-[64ch] leading-relaxed text-navy-soft">
                    Under India&apos;s IT Rules, Poocho will name a Grievance Officer with contact details on this page before
                    public launch.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

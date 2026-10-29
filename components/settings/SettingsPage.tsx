"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { IconArrowLeft, IconX } from "@/components/ui/Icons";
import { Segmented } from "@/components/ui/Segmented";
import { useToast } from "@/components/ui/Toast";
import { exportCSV, exportJSON } from "@/lib/export";
import { normalise } from "@/lib/moderation";
import { FILTER_OPTIONS, MODE_OPTIONS } from "@/lib/options";
import { deleteEverything, updateProfile } from "@/lib/poocho";
import { downloadBlob } from "@/lib/share";
import { useDB } from "@/lib/store";
import type { Profile } from "@/lib/types";

export function SettingsPage() {
  const db = useDB();
  if (db === null) return <div className="h-[60vh] animate-pulse rounded-[12px] bg-white/60" />;
  if (!db.profile) {
    return (
      <Section title="No link on this device">
        <p className="text-navy-soft">Create a link first, then you can change how it works here.</p>
        <ButtonLink href="/start" className="mt-5">
          Get your link
        </ButtonLink>
      </Section>
    );
  }
  return <Settings profile={db.profile} />;
}

function Settings({ profile }: { profile: Profile }) {
  const db = useDB();
  const toast = useToast();
  const router = useRouter();
  const [word, setWord] = useState("");
  const [confirm, setConfirm] = useState("");
  const ids = { name: useId(), prompt: useId(), word: useId(), confirm: useId(), pause: useId() };

  const addWord = () => {
    const w = normalise(word);
    if (!w) return;
    if (!profile.blockedWords.includes(w)) updateProfile({ blockedWords: [...profile.blockedWords, w] });
    setWord("");
  };

  return (
    <div className="grid gap-8">
      <div>
        <Link href="/inbox" className="inline-flex items-center gap-2 font-semibold text-ink underline-offset-4 hover:underline">
          <IconArrowLeft className="h-4 w-4" /> Inbox
        </Link>
        <h1 className="mt-3 text-[clamp(2rem,5vw,2.8rem)] leading-none font-extrabold tracking-[-0.03em] stretch-wide">Settings</h1>
        <p className="mt-2 text-navy-soft">Changes save as you make them.</p>
      </div>

      <Section title="Your page">
        <label htmlFor={ids.name} className="block font-semibold">
          Name shown on your page
        </label>
        <input
          id={ids.name}
          defaultValue={profile.displayName}
          onBlur={(e) => e.target.value.trim() && updateProfile({ displayName: e.target.value.trim().slice(0, 40) })}
          className="field mt-2"
        />
        <label htmlFor={ids.prompt} className="mt-5 block font-semibold">
          Prompt
        </label>
        <input
          id={ids.prompt}
          defaultValue={profile.prompt}
          key={profile.prompt}
          maxLength={80}
          onBlur={(e) => e.target.value.trim() && updateProfile({ prompt: e.target.value.trim() })}
          className="field mt-2 font-hand text-[1.2rem] text-ink"
        />
      </Section>

      <Section title="Who can ask">
        <Segmented label="Link mode" options={MODE_OPTIONS} value={profile.mode} onChange={(mode) => updateProfile({ mode })} name="s-mode" />
      </Section>

      <Section title="Filter">
        <Segmented
          label="How strict"
          options={FILTER_OPTIONS}
          value={profile.filterLevel}
          onChange={(filterLevel) => updateProfile({ filterLevel })}
          name="s-filter"
        />
        <p className="mt-3 text-[0.95rem] text-navy-soft">
          Threats, self-harm and personal details like phone numbers are always filtered. No filter catches everything, so you can
          also move any question to Filtered yourself.
        </p>

        <label htmlFor={ids.word} className="mt-7 block font-semibold">
          Blocked words
        </label>
        <p className="text-[0.95rem] text-navy-soft">Questions containing these always go to Filtered. Hindi, English and Hinglish all work.</p>
        <div className="mt-2 flex gap-2">
          <input
            id={ids.word}
            value={word}
            onChange={(e) => setWord(e.target.value.slice(0, 40))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addWord();
              }
            }}
            placeholder="Add a word or phrase"
            className="field"
          />
          <Button variant="paper" onClick={addWord}>
            Add
          </Button>
        </div>
        {profile.blockedWords.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {profile.blockedWords.map((w) => (
              <li key={w} className="inline-flex items-center gap-1 rounded-full border-2 border-navy bg-white py-0.5 pr-1 pl-3 text-[0.95rem]">
                {w}
                <button
                  type="button"
                  aria-label={`Remove ${w}`}
                  onClick={() => updateProfile({ blockedWords: profile.blockedWords.filter((x) => x !== w) })}
                  className="grid h-7 w-7 place-items-center rounded-full hover:bg-paper-dim"
                >
                  <IconX className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Pause your inbox">
        <label htmlFor={ids.pause} className="flex cursor-pointer items-center justify-between gap-6">
          <span>
            <span className="block font-semibold">Pause new questions</span>
            <span className="block text-[0.95rem] text-navy-soft">Your page stays up, but the ask box is switched off until you resume.</span>
          </span>
          <input
            id={ids.pause}
            type="checkbox"
            role="switch"
            checked={profile.paused}
            onChange={(e) => updateProfile({ paused: e.target.checked })}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="relative h-8 w-14 shrink-0 rounded-full border-2 border-navy bg-paper-dim transition-colors peer-checked:bg-ink peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink after:absolute after:top-0.5 after:left-0.5 after:h-6 after:w-6 after:rounded-full after:border-2 after:border-navy after:bg-white after:transition-transform peer-checked:after:translate-x-6"
          />
        </label>
      </Section>

      <Section title="Your data">
        <p className="text-navy-soft">Download everything: your settings, every question and every answer.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="paper" onClick={() => db && downloadBlob(exportJSON(db), `poocho-${profile.handle}.json`)}>
            Export JSON
          </Button>
          <Button variant="paper" onClick={() => db && downloadBlob(exportCSV(db), `poocho-${profile.handle}.csv`)}>
            Export CSV
          </Button>
        </div>

        <div className="mt-8 rounded-[14px] border-2 border-margin p-4">
          <p className="font-semibold">Delete everything</p>
          <p className="mt-1 text-[0.95rem] text-navy-soft">
            This removes @{profile.handle}, its questions and answers from this device. It can&apos;t be undone.
          </p>
          <label htmlFor={ids.confirm} className="mt-4 block text-[0.95rem] font-medium">
            Type <strong>{profile.handle}</strong> to confirm
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              id={ids.confirm}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="off"
              className="field max-w-[260px]"
            />
            <Button
              variant="danger"
              disabled={confirm.trim().replace(/^@/, "") !== profile.handle}
              onClick={() => {
                deleteEverything();
                toast("Everything was deleted.");
                router.push("/");
              }}
            >
              Delete everything
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] border-2 border-navy bg-white p-5 sm:p-7">
      <h2 className="mb-4 text-[1.3rem] font-bold stretch-semi">{title}</h2>
      {children}
    </section>
  );
}

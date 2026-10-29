"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SignIn, useAuth, useUser } from "@clerk/nextjs";
import { Suspense, useId, useRef, useState, useSyncExternalStore } from "react";
import { createProfileAction, handleStatusAction } from "@/app/actions";
import { StoryCanvas } from "@/components/story/StoryCanvas";
import { useShareCard } from "@/components/story/useShareCard";
import { Button, ButtonLink } from "@/components/ui/Button";
import { IconCheck, IconCopy, IconShare, IconX } from "@/components/ui/Icons";
import { Segmented } from "@/components/ui/Segmented";
import { useToast } from "@/components/ui/Toast";
import { ageFrom, MIN_AGE } from "@/lib/age";
import { checkHandle, cleanHandle } from "@/lib/handle";
import { IDEAS } from "@/lib/ideas";
import { FILTER_OPTIONS, MODE_OPTIONS } from "@/lib/options";
import { copyText } from "@/lib/share";
import { askPath, askUrl, displayHost } from "@/lib/site";
import { useInbox } from "@/lib/client/useInbox";
import { drawInviteCard } from "@/lib/story-card";
import type { FilterLevel, LinkMode, Profile } from "@/lib/types";

const STEPS = ["Age", "Account", "Link", "Questions", "Share"] as const;
const AGE_KEY = "poocho:age-ok";
const AGE_TTL_MS = 24 * 60 * 60 * 1000;

/*
 * The age check survives the sign-in round trip (Google redirects away, and a
 * magic link can open in a new tab), so only the fact that it passed is kept
 * in this browser for a day. The date of birth itself is never stored.
 */
function ageCheckPassed(): boolean {
  try {
    const at = Number(window.localStorage.getItem(AGE_KEY));
    return Number.isFinite(at) && Date.now() - at < AGE_TTL_MS;
  } catch {
    return false;
  }
}

const noSubscribe = () => () => {};

function rememberAgeCheck(passed: boolean) {
  try {
    if (passed) window.localStorage.setItem(AGE_KEY, String(Date.now()));
    else window.localStorage.removeItem(AGE_KEY);
  } catch {
    /* storage blocked: the visitor just repeats the check */
  }
}

export function StartFlow() {
  const params = useSearchParams();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { state: inbox } = useInbox({ poll: false });
  const reduce = useReducedMotion();
  const toast = useToast();
  const shareCard = useShareCard();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // The step the host chose. The step shown can run ahead of it: see `step` below.
  const [chosen, setStep] = useState(0);
  const [dob, setDob] = useState("");
  const [tooYoung, setTooYoung] = useState(false);
  // null until the host types, so the name from their Google or Clerk profile can fill in first.
  const [name, setName] = useState<string | null>(null);
  const [handleInput, setHandleInput] = useState(() => cleanHandle(params.get("handle") ?? ""));
  const [prompt, setPrompt] = useState("Ask me anything!");
  const [mode, setMode] = useState<LinkMode>("anonymous");
  const [filterLevel, setFilterLevel] = useState<FilterLevel>("standard");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const ids = { dob: useId(), name: useId(), handle: useId(), prompt: useId(), status: useId(), error: useId() };

  const existing = inbox.status === "ready" ? inbox.data.profile : null;
  const handle = cleanHandle(handleInput);
  const check = checkHandle(handleInput);

  // Coming back from sign-in with the age check already passed skips ahead.
  const agePassed = useSyncExternalStore(noSubscribe, ageCheckPassed, () => false);
  let step = chosen;
  if (step === 0 && agePassed && isLoaded) step = isSignedIn ? 2 : 1;
  if (step === 1 && isSignedIn) step = 2;

  const suggestedName = user?.fullName || user?.firstName || "";

  const go = (next: number) => {
    setError("");
    setStep(next);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const submitAge = () => {
    const age = ageFrom(dob);
    if (age === null) return setError("Enter your date of birth.");
    if (age < MIN_AGE) {
      // PRD US-1: under 18 means no account and nothing kept.
      setDob("");
      rememberAgeCheck(false);
      setTooYoung(true);
      return;
    }
    rememberAgeCheck(true);
    go(isSignedIn ? 2 : 1);
  };

  const displayName = name ?? suggestedName;

  const submitLink = async () => {
    if (!displayName.trim()) return setError("Add the name people will see on your page.");
    if (!check.ok) return setError(check.reason === "invalid" ? "Use 3–20 letters, numbers or underscores." : `@${handle} isn't available. Try another.`);
    setBusy(true);
    try {
      const status = await handleStatusAction(handle);
      if (status === "taken") return setError(`@${handle} is taken. Try another.`);
      if (status !== "free") return setError(`@${handle} isn't available. Try another.`);
      go(3);
    } catch {
      setError("We couldn't check that link. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const submitQuestions = async () => {
    setBusy(true);
    try {
      const result = await createProfileAction({ handle, displayName, prompt, mode, filterLevel });
      if (result.ok) {
        rememberAgeCheck(false);
        setCreated(result.profile);
        go(4);
      } else if (result.reason === "exists") {
        setError("This account already has a link. Open your inbox to use it.");
      } else {
        setError(`@${handle} was just taken. Go back and pick another link.`);
      }
    } catch {
      setError("Your link wasn't created. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  if (tooYoung) {
    return (
      <Card>
        <h1 tabIndex={-1} className="text-[2rem] leading-tight font-extrabold stretch-wide focus:outline-none">
          Poocho is for people 18 and over
        </h1>
        <p className="mt-4 text-[1.1rem]">
          We can&apos;t create a link for you yet. Nothing you entered has been saved.
        </p>
        <ButtonLink href="/" variant="paper" className="mt-6">
          Back to home
        </ButtonLink>
      </Card>
    );
  }

  if (existing && !created) {
    return (
      <Card>
        <h1 className="text-[2rem] leading-tight font-extrabold stretch-wide">You already have a link</h1>
        <p className="mt-4 text-[1.1rem]">
          Your account owns <strong>{displayHost()}/@{existing.handle}</strong>. Each account has one link.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/inbox">Open my inbox</ButtonLink>
          <ButtonLink href={askPath(existing.handle)} variant="paper">
            See my ask page
          </ButtonLink>
        </div>
      </Card>
    );
  }

  const enter = reduce ? { opacity: 0 } : { opacity: 0, x: 48, rotate: 1.5 };
  const exit = reduce ? { opacity: 0 } : { opacity: 0, x: -48, rotate: -1.5 };

  return (
    <div>
      <ol aria-label="Steps" className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2" aria-current={i === step ? "step" : undefined}>
            <span
              className={`grid h-9 w-9 place-items-center rounded-full border-2 border-navy font-hand text-[1.1rem] font-bold transition-colors ${
                i < step ? "bg-ink text-white" : i === step ? "bg-haldi" : "bg-white"
              }`}
            >
              {i < step ? <IconCheck className="h-4 w-4" /> : i + 1}
            </span>
            <span className={`hidden text-[0.95rem] sm:inline ${i === step ? "font-semibold" : "text-navy-soft"}`}>{label}</span>
            {i < STEPS.length - 1 && <span aria-hidden="true" className="h-0.5 w-4 bg-navy/25 sm:w-8" />}
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={enter}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          exit={exit}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {step === 1 ? (
            <Card>
              <Heading refEl={headingRef}>Create your account</Heading>
              <p className="mt-3 text-navy-soft">
                So only you can open your inbox. Use Google, or get a one-time link by email. There&apos;s no password.
              </p>
              <div className="mt-6">
                <Suspense fallback={<div className="h-[380px] animate-pulse rounded-[16px] bg-paper-dim" />}>
                  <SignIn routing="hash" withSignUp forceRedirectUrl="/start" signUpForceRedirectUrl="/start" />
                </Suspense>
              </div>
              <button
                type="button"
                onClick={() => {
                  rememberAgeCheck(false);
                  go(0);
                }}
                className="mt-6 font-semibold underline underline-offset-4"
              >
                Back
              </button>
            </Card>
          ) : (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (busy) return;
              if (step === 0) submitAge();
              else if (step === 2) void submitLink();
              else if (step === 3) void submitQuestions();
            }}
          >
            <Card>
              {step === 0 && (
                <>
                  <Heading refEl={headingRef}>First, how old are you?</Heading>
                  <p className="mt-3 text-navy-soft">
                    Poocho is 18+ for hosts and askers. We only keep the fact that you passed this check, never your birthday.
                  </p>
                  <label htmlFor={ids.dob} className="mt-7 block font-semibold">
                    Date of birth
                  </label>
                  <input
                    id={ids.dob}
                    type="date"
                    value={dob}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setDob(e.target.value)}
                    aria-describedby={error ? ids.error : undefined}
                    className="field mt-2"
                  />
                </>
              )}

              {step === 2 && (
                <>
                  <Heading refEl={headingRef}>Pick your link</Heading>
                  <p className="mt-3 text-navy-soft">This is what you&apos;ll post on your story and in your bio.</p>
                  <label htmlFor={ids.name} className="mt-7 block font-semibold">
                    Your name
                  </label>
                  <input
                    id={ids.name}
                    value={displayName}
                    onChange={(e) => setName(e.target.value.slice(0, 40))}
                    autoComplete="name"
                    placeholder="Ananya Verma"
                    className="field mt-2"
                  />
                  <label htmlFor={ids.handle} className="mt-6 block font-semibold">
                    Your link
                  </label>
                  <div className="mt-2 flex h-12 items-center rounded-[10px] border-2 border-navy bg-white text-[1.05rem] focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-ink">
                    <span className="shrink-0 pl-3 text-navy/50">{displayHost()}/@</span>
                    <input
                      id={ids.handle}
                      value={handleInput}
                      onChange={(e) => setHandleInput(e.target.value.slice(0, 24))}
                      autoCapitalize="none"
                      autoComplete="off"
                      spellCheck={false}
                      aria-describedby={ids.status}
                      className="h-full min-w-0 flex-1 bg-transparent pr-3 text-ink focus:outline-none"
                      placeholder="yourname"
                    />
                  </div>
                  <p id={ids.status} aria-live="polite" className="mt-2 min-h-6 text-[0.95rem]">
                    {handle &&
                      (check.ok ? (
                        <span className="inline-flex items-center gap-1.5 text-navy-soft">
                          <IconCheck /> {displayHost()}/@{handle}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-margin-deep">
                          <IconX />
                          {check.reason === "invalid" ? "Use 3–20 letters, numbers or underscores" : `@${handle} isn't available`}
                        </span>
                      ))}
                  </p>
                </>
              )}

              {step === 3 && (
                <>
                  <Heading refEl={headingRef}>What should people ask you about?</Heading>
                  <label htmlFor={ids.prompt} className="mt-6 block font-semibold">
                    Your prompt
                  </label>
                  <div className="paper-shadow mt-2">
                    <div className="torn margin-line rounded-[4px] bg-white px-4 pt-4 pb-1 [--margin-x:1.4rem]">
                      <textarea
                        id={ids.prompt}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value.slice(0, 80))}
                        rows={2}
                        className="ruled block w-full resize-none bg-transparent pl-5 font-hand text-[1.5rem] leading-[2.25rem] font-bold text-ink focus:outline-none [--line:2.25rem]"
                      />
                    </div>
                  </div>
                  <div className="mt-4 rounded-[12px] border-2 border-dashed border-navy/30 p-3">
                    <p className="text-[0.9rem] font-semibold text-navy-soft">Ideas from Poocho</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {IDEAS.slice(0, 6).map((idea) => (
                        <button
                          key={idea.en}
                          type="button"
                          onClick={() => setPrompt(idea.en)}
                          className="rounded-full border-2 border-navy/20 bg-white px-3 py-1 text-[0.92rem] hover:border-navy"
                        >
                          {idea.en}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-7 grid gap-6">
                    <Segmented label="Who can ask" options={MODE_OPTIONS} value={mode} onChange={setMode} name="mode" />
                    <Segmented label="Filter strictness" options={FILTER_OPTIONS} value={filterLevel} onChange={setFilterLevel} name="filter" />
                  </div>
                </>
              )}

              {step === 4 && created && (
                <>
                  <Heading refEl={headingRef}>Your link is ready</Heading>
                  <p className="mt-3 text-navy-soft">
                    Share this card on your story, then add a Link sticker with your link so people can tap through.
                  </p>
                  <div className="mt-6 grid items-start gap-6 sm:grid-cols-[200px_1fr]">
                    <div className="mx-auto w-[200px] overflow-hidden rounded-[12px] border-2 border-navy">
                      <StoryCanvas
                        kind="invite"
                        resolution={0.4}
                        label={`Story card: ${created.prompt}, ${displayHost()}/@${created.handle}`}
                        content={{ prompt: created.prompt, handle: created.handle, host: displayHost() }}
                      />
                    </div>
                    <div className="grid content-start gap-3">
                      <p className="rounded-[10px] bg-paper-dim px-3 py-2 font-semibold break-all text-ink">
                        {displayHost()}/@{created.handle}
                      </p>
                      <Button
                        variant="ink"
                        onClick={() =>
                          void shareCard(
                            (ctx) => drawInviteCard(ctx, { prompt: created.prompt, handle: created.handle, host: displayHost() }),
                            `poocho-${created.handle}.png`,
                            askUrl(created.handle),
                          )
                        }
                      >
                        <IconShare /> Share to story
                      </Button>
                      <Button
                        variant="paper"
                        onClick={async () => toast((await copyText(askUrl(created.handle))) ? "Link copied." : "Copy failed. Select the link and copy it.")}
                      >
                        <IconCopy /> Copy link
                      </Button>
                      <ButtonLink href="/inbox" variant="haldi">
                        Open my inbox
                      </ButtonLink>
                      <Link href={askPath(created.handle)} className="mt-1 w-fit font-semibold text-ink underline underline-offset-4">
                        See my ask page
                      </Link>
                    </div>
                  </div>
                </>
              )}

              {error && (
                <p id={ids.error} role="alert" className="mt-5 rounded-[10px] border-2 border-margin bg-[#fde3e8] px-3 py-2 font-medium">
                  {error}
                </p>
              )}

              {step < 4 && (
                <div className="mt-8 flex items-center justify-between gap-3">
                  {step === 3 ? (
                    <button type="button" onClick={() => go(2)} className="font-semibold underline underline-offset-4">
                      Back
                    </button>
                  ) : (
                    <span />
                  )}
                  <Button type="submit" size="lg" disabled={busy}>
                    {busy ? "One moment…" : step === 3 ? "Create my link" : "Continue"}
                  </Button>
                </div>
              )}
            </Card>
          </form>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="paper-shadow">
      <div className="torn rounded-[6px] bg-white px-5 pt-9 pb-7 sm:px-9">{children}</div>
    </div>
  );
}

function Heading({ children, refEl }: { children: React.ReactNode; refEl: React.RefObject<HTMLHeadingElement | null> }) {
  return (
    <h1 ref={refEl} tabIndex={-1} className="text-[clamp(1.8rem,5vw,2.4rem)] leading-tight font-extrabold tracking-[-0.02em] stretch-wide focus:outline-none">
      {children}
    </h1>
  );
}

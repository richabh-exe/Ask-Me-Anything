"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { handleStatusAction } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { IconCheck, IconX } from "@/components/ui/Icons";
import { UrlText } from "@/components/ui/UrlText";
import { checkHandle, cleanHandle } from "@/lib/handle";
import { useSiteHost } from "@/lib/client/useSiteHost";
import { useI18n } from "@/lib/i18n";

export function ClaimLink() {
  const { t } = useI18n();
  const host = useSiteHost();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [value, setValue] = useState("");
  const [remote, setRemote] = useState<{ handle: string; status: "free" | "taken" | "mine" | "invalid" | "reserved" } | null>(null);
  const inputId = useId();
  const statusId = useId();

  const handle = cleanHandle(value);
  const check = checkHandle(value);

  // Format problems show instantly; availability comes from the server after a short pause.
  useEffect(() => {
    if (!check.ok) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const result = await handleStatusAction(check.handle);
        if (!cancelled) setRemote({ handle: check.handle, status: result });
      } catch {
        if (!cancelled) setRemote(null);
      }
    }, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [check.ok, check.handle]);

  const status: "empty" | "checking" | "free" | "taken" | "mine" | "invalid" | "reserved" = !handle
    ? "empty"
    : !check.ok
      ? check.reason
      : remote?.handle === handle
        ? remote.status
        : "checking";

  const message =
    status === "free"
      ? t("claim.free", { h: handle })
      : status === "mine"
        ? t("claim.mine", { h: handle })
        : status === "taken"
          ? t("claim.taken", { h: handle })
          : status === "checking"
            ? t("claim.checking")
            : status === "invalid"
              ? t("claim.invalid")
              : status === "reserved"
                ? t("claim.reserved", { h: handle })
                : "";

  return (
    <section aria-labelledby="claim-title" className="on-paper bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
        <h2 id="claim-title" className="text-[clamp(2.4rem,6vw,4.4rem)] font-extrabold tracking-[-0.035em] stretch-wide">
          {t("claim.title")}
        </h2>

        <form
          className="mt-10"
          onSubmit={(e) => {
            e.preventDefault();
            if (status === "mine") router.push("/inbox");
            else if (status === "free") router.push(`/start?handle=${encodeURIComponent(handle)}`);
          }}
        >
          <label htmlFor={inputId} className="sr-only">
            {t("claim.label")}
          </label>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end">
            {/* The host sits on its own line so a long domain never squeezes the handle. */}
            <div className="min-w-0 flex-1">
              <p className="text-[clamp(1.05rem,2vw,1.35rem)] font-semibold text-navy/45 stretch-semi">
                <UrlText url={`${host}/`} />
              </p>
              <div className="mt-1 flex items-baseline border-b-[3px] border-navy pb-2 text-[clamp(1.6rem,5vw,3.4rem)] leading-none font-bold stretch-semi">
                <span className="shrink-0 text-navy/45">@</span>
                <input
                  id={inputId}
                  value={value}
                  onChange={(e) => setValue(e.target.value.slice(0, 24))}
                  placeholder="yourname"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-describedby={statusId}
                  aria-invalid={status === "invalid" || status === "reserved"}
                  className="w-full min-w-0 bg-transparent text-ink placeholder:text-navy/20 focus:outline-none focus-visible:outline-none"
                />
              </div>
            </div>
            <Button type="submit" variant="ink" size="lg" disabled={status !== "free" && status !== "mine"} className="w-full lg:w-auto">
              {status === "mine" ? t("claim.open") : t("claim.cta", { h: handle || "you" })}
            </Button>
          </div>
          <div id={statusId} aria-live="polite" className="mt-4 min-h-8 text-[1.05rem]">
            <AnimatePresence mode="wait" initial={false}>
              {message && (
                <motion.p
                  key={status + handle}
                  initial={{ opacity: 0, y: reduce ? 0 : -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.16 }}
                  className={`inline-flex items-center gap-2 font-medium ${
                    status === "free" || status === "mine" ? "text-leaf" : status === "checking" ? "text-navy-soft" : "text-margin-deep"
                  }`}
                >
                  {status === "free" || status === "mine" ? (
                    <IconCheck className="h-5 w-5" />
                  ) : status === "checking" ? null : (
                    <IconX className="h-5 w-5" />
                  )}
                  {message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>
    </section>
  );
}

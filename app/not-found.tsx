import { ButtonLink } from "@/components/ui/Button";
import { SiteNav } from "@/components/ui/SiteNav";

export default function NotFound() {
  return (
    <main id="main" className="desk flex-1 pb-24 text-white">
      <SiteNav tone="ink" />
      <div className="mx-auto grid max-w-[1000px] items-center gap-10 px-4 pt-10 sm:px-8 md:grid-cols-[1fr_1fr]">
        <div>
          <h1 className="text-[clamp(2.6rem,7vw,4.6rem)] leading-[0.95] font-extrabold tracking-[-0.03em] stretch-wide">
            This chit got lost
          </h1>
          <p className="mt-5 max-w-[34ch] text-[1.2rem] text-white/85">
            The page you were passed doesn&apos;t exist. Check the link, or head back to the start.
          </p>
          <ButtonLink href="/" variant="haldi" size="lg" className="mt-8">
            Back to Poocho
          </ButtonLink>
        </div>
        <svg viewBox="0 0 320 260" className="mx-auto w-full max-w-[340px] rotate-6" aria-hidden="true">
          <path
            d="M40 70 L110 30 L170 60 L250 26 L290 110 L262 150 L284 220 L190 236 L150 210 L70 238 L30 170 L58 130 Z"
            fill="#fff"
            stroke="#13195A"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path d="M110 30 L130 120 L58 130 M170 60 L130 120 L150 210 M250 26 L196 130 L262 150 M196 130 L190 236" fill="none" stroke="#13195A" strokeWidth="3" opacity=".35" />
          <path d="M118 96c4-18 20-26 36-22 15 4 22 18 17 30-5 13-21 16-27 25" fill="none" stroke="#2940D9" strokeWidth="9" strokeLinecap="round" />
          <circle cx="146" cy="160" r="7" fill="#2940D9" />
        </svg>
      </div>
    </main>
  );
}

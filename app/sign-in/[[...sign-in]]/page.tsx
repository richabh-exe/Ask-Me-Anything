import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteNav } from "@/components/ui/SiteNav";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default function SignInPage() {
  return (
    <main id="main" className="on-paper flex-1 bg-paper-dim pb-20">
      <SiteNav tone="paper" />
      <div className="mx-auto grid max-w-[1000px] items-start gap-10 px-4 pt-6 sm:px-8 md:grid-cols-[1fr_auto] md:pt-12">
        <div className="max-w-[30ch]">
          <h1 className="text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.02] font-extrabold tracking-[-0.03em] stretch-wide">
            Welcome back to your inbox
          </h1>
          <p className="mt-4 text-[1.1rem] text-navy-soft">
            Sign in with Google, or get a one-time link by email. No passwords to remember.
          </p>
        </div>
        <Suspense fallback={<div className="h-[440px] w-full max-w-[400px] animate-pulse rounded-[16px] bg-white/70" />}>
          <SignIn withSignUp fallbackRedirectUrl="/inbox" signUpFallbackRedirectUrl="/start" />
        </Suspense>
      </div>
    </main>
  );
}

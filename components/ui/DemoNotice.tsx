/*
 * Shown on host screens while there is no backend: the honest version of
 * "your account". Remove once data lives on a server.
 */
export function DemoNotice({ className = "" }: { className?: string }) {
  return (
    <p className={`mb-6 flex items-start gap-2 rounded-[10px] border-2 border-dashed border-navy/30 px-3 py-2 text-[0.92rem] leading-snug text-navy-soft ${className}`}>
      <span aria-hidden="true" className="mt-0.5 font-hand text-[1.1rem] leading-none text-margin">✱</span>
      <span>
        Preview build: your link, questions and answers are saved in this browser only. Sign-in and delivery between
        devices arrive with the server.
      </span>
    </p>
  );
}

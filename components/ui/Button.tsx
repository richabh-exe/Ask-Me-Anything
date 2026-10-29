import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "ink" | "haldi" | "paper" | "danger";
type Size = "md" | "lg" | "sm";

const VARIANTS: Record<Variant, string> = {
  ink: "bg-ink text-white hover:bg-ink-deep",
  haldi: "bg-haldi text-navy hover:bg-[#ffcd1a]",
  paper: "bg-white text-navy hover:bg-paper",
  danger: "bg-margin text-white hover:bg-margin-deep",
};

const SIZES: Record<Size, string> = {
  sm: "h-10 px-4 text-[0.95rem]",
  md: "h-12 px-6 text-[1.05rem]",
  lg: "h-14 px-7 text-[1.15rem]",
};

export function buttonClass(variant: Variant = "ink", size: Size = "md", extra = "") {
  return [
    "sticker inline-flex select-none items-center justify-center gap-2 rounded-full pt-[0.14em] font-semibold leading-none whitespace-nowrap stretch-semi",
    VARIANTS[variant],
    SIZES[size],
    extra,
  ].join(" ");
}

interface Common {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant, size, className = "", type = "button", ...props }: Common & ComponentProps<"button">) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({ variant, size, className = "", ...props }: Common & ComponentProps<typeof Link>) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

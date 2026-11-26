import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/** Page-width wrapper with the standard gutters (see DESIGN.md → Spacing and layout). */
export function Container({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`mx-auto w-full max-w-page px-4 sm:px-6 lg:px-8 ${className}`} {...props} />;
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50";
const sizeMd = "h-12 px-5 text-base";
const sizeSm = "h-10 px-4 text-sm";

export const buttonStyles = {
  primary: `${buttonBase} ${sizeMd} bg-primary text-on-primary hover:bg-primary-hover`,
  secondary: `${buttonBase} ${sizeMd} border border-border-strong bg-surface text-fg hover:bg-muted`,
  primarySmall: `${buttonBase} ${sizeSm} bg-primary text-on-primary hover:bg-primary-hover`,
  secondarySmall: `${buttonBase} ${sizeSm} border border-border-strong bg-surface text-fg hover:bg-muted`,
  quiet: "inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline",
} as const;

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: keyof typeof buttonStyles }) {
  return <Link className={`${buttonStyles[variant]} ${className}`} {...props} />;
}

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: "neutral" | "savings" | "warning" | "primary";
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    neutral: "bg-muted text-fg-muted",
    savings: "bg-savings-soft text-on-savings-soft",
    warning: "bg-warning-soft text-warning",
    primary: "bg-primary-soft text-on-primary-soft",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-caption font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

import { CookingPot } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-md bg-primary text-on-primary"
      >
        <CookingPot className="size-5" strokeWidth={2} />
      </span>
      <span className="font-display text-h4 font-extrabold tracking-tight text-fg">{siteConfig.name}</span>
    </span>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Headline } from "./Headline";
import { Reveal } from "./Reveal";

interface SectionHeaderProps {
  label: string;
  title: ReactNode[];
  subtitle?: ReactNode;
  dark?: boolean;
  className?: string;
  titleClassName?: string;
  index?: string;
}

/** Label + oversized serif title + optional right-aligned subtitle. */
export function SectionHeader({
  label,
  title,
  subtitle,
  dark = false,
  className,
  titleClassName,
  index,
}: SectionHeaderProps) {
  return (
    <div className={cn("grid gap-8 lg:grid-cols-12 lg:items-end", className)}>
      <div className="lg:col-span-8">
        <Reveal>
          <p
            className={cn(
              "label flex items-center gap-4",
              dark ? "text-ivory/50" : "text-ink/50",
            )}
          >
            {index && <span className="font-serif text-base tracking-normal">{index}</span>}
            <span className="h-px w-10 bg-current" />
            {label}
          </p>
        </Reveal>
        <Headline
          lines={title}
          className={cn(
            "mt-6 text-[clamp(2.75rem,9vw,6.75rem)]",
            dark ? "text-ivory" : "text-ink",
            titleClassName,
          )}
        />
      </div>
      {subtitle && (
        <Reveal delay={0.25} className="lg:col-span-4 lg:pb-3">
          <p
            className={cn(
              "max-w-md text-base font-light leading-relaxed md:text-lg",
              dark ? "text-ivory/65" : "text-ink/65",
            )}
          >
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}

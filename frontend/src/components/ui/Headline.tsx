import { motion, useReducedMotion } from "framer-motion";
import type { ElementType, ReactNode } from "react";
import { cn } from "@/utils/cn";
import { EASE, VIEWPORT } from "@/lib/motion";

interface HeadlineProps {
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  immediate?: boolean;
}

/** Line-by-line masked text reveal for editorial headlines. */
export function Headline({
  lines,
  as: Tag = "h2",
  className,
  delay = 0,
  stagger = 0.11,
  immediate = false,
}: HeadlineProps) {
  const reduce = useReducedMotion();

  return (
    <Tag className={cn("display", className)}>
      {lines.map((line, i) => (
        <span
          key={i}
          className="-mt-[0.14em] -mb-[0.12em] block overflow-hidden pt-[0.14em] pb-[0.12em]"
        >
          {reduce ? (
            <span className="block">{line}</span>
          ) : (
            <motion.span
              className="block will-change-transform"
              initial={{ y: "112%" }}
              {...(immediate ? { animate: { y: 0 } } : { whileInView: { y: 0 }, viewport: VIEWPORT })}
              transition={{ duration: 1.15, delay: delay + i * stagger, ease: EASE }}
            >
              {line}
            </motion.span>
          )}
        </span>
      ))}
    </Tag>
  );
}

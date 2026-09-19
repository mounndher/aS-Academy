import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/utils/cn";
import { usePhoto } from "@/hooks/usePhoto";
import { EASE, VIEWPORT } from "@/lib/motion";

interface ImageRevealProps {
  src: string;
  /** Hosted photo used when `src` (authentic file) is not available yet */
  fallback?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  hover?: boolean;
  delay?: number;
  direction?: "up" | "left" | "right";
}

/** Clip-path image reveal with slow scale settle and subtle hover zoom. */
export function ImageReveal({
  src,
  fallback,
  alt,
  className,
  imgClassName,
  priority = false,
  hover = true,
  delay = 0,
  direction = "up",
}: ImageRevealProps) {
  const reduce = useReducedMotion();
  const resolved = usePhoto(src, fallback);

  const from =
    direction === "left"
      ? "inset(0% 100% 0% 0%)"
      : direction === "right"
        ? "inset(0% 0% 0% 100%)"
        : "inset(100% 0% 0% 0%)";

  return (
    <div className={cn("relative overflow-hidden bg-sand/40", hover && "group", className)}>
      <motion.div
        className="h-full w-full"
        initial={reduce ? false : { clipPath: from }}
        whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
        viewport={VIEWPORT}
        transition={{ duration: 1.3, delay, ease: EASE }}
      >
        <motion.div
          className="h-full w-full"
          initial={reduce ? false : { scale: 1.14 }}
          whileInView={{ scale: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 1.7, delay, ease: EASE }}
        >
          <img
            src={resolved}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className={cn(
              "h-full w-full object-cover",
              hover &&
                "transition-transform duration-[1400ms] ease-luxury group-hover:scale-[1.05]",
              imgClassName,
            )}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

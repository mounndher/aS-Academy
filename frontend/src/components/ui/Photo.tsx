import { usePhoto } from "@/hooks/usePhoto";
import { cn } from "@/utils/cn";

interface PhotoProps {
  src: string;
  fallback?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}

/** Plain <img> with authentic-first / fallback resolution. */
export function Photo({ src, fallback, alt, className, imgClassName, priority }: PhotoProps) {
  const resolved = usePhoto(src, fallback);
  return (
    <span className={cn("block h-full w-full", className)}>
      <img
        src={resolved}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn("h-full w-full object-cover", imgClassName)}
      />
    </span>
  );
}

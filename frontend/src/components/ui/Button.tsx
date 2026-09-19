import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/utils/cn";

type Variant = "dark" | "light" | "outline-dark" | "outline-light" | "link-dark" | "link-light";
type Size = "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  icon?: "arrow" | "external" | "none";
}

type LinkProps = BaseProps & { to: string; href?: never; onClick?: () => void; state?: unknown };
type AnchorProps = BaseProps & { href: string; to?: never; target?: string; rel?: string };
type NativeProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    to?: never;
    href?: never;
  };

export type ButtonProps = LinkProps | AnchorProps | NativeProps;

const variants: Record<Variant, string> = {
  dark: "bg-ink text-ivory border border-ink hover:bg-graphite hover:border-graphite",
  light: "bg-ivory text-ink border border-ivory hover:bg-white hover:border-white",
  "outline-dark":
    "border border-ink/25 text-ink hover:bg-ink hover:text-ivory hover:border-ink",
  "outline-light":
    "border border-ivory/30 text-ivory hover:bg-ivory hover:text-ink hover:border-ivory",
  "link-dark": "text-ink link-line",
  "link-light": "text-ivory link-line",
};

const sizes: Record<Size, string> = {
  md: "px-7 py-[1.05rem] text-[11px]",
  lg: "px-9 py-5 text-[11px] sm:text-xs",
};

export function Button(props: ButtonProps) {
  const { variant = "dark", size = "md", className, children, icon = "none" } = props;
  const isLink = variant.startsWith("link");

  const classes = cn(
    "group/btn inline-flex items-center justify-center gap-3 uppercase tracking-[0.22em] font-medium",
    "transition-all duration-500 ease-luxury select-none whitespace-nowrap",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    !isLink && sizes[size],
    isLink && "text-[11px] py-1",
    className,
  );

  const content = (
    <>
      <span>{children}</span>
      {icon === "arrow" && (
        <ArrowRight
          size={14}
          strokeWidth={1.5}
          className="transition-transform duration-500 ease-luxury group-hover/btn:translate-x-1"
        />
      )}
      {icon === "external" && (
        <ArrowUpRight
          size={14}
          strokeWidth={1.5}
          className="transition-transform duration-500 ease-luxury group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
        />
      )}
    </>
  );

  if ("to" in props && props.to) {
    return (
      <Link to={props.to} state={props.state} className={classes} onClick={props.onClick}>
        {content}
      </Link>
    );
  }

  if ("href" in props && props.href) {
    return (
      <a
        href={props.href}
        target={props.target ?? "_blank"}
        rel={props.rel ?? "noreferrer"}
        className={classes}
      >
        {content}
      </a>
    );
  }

  const { variant: _v, size: _s, icon: _i, className: _c, children: _ch, ...rest } =
    props as NativeProps;
  void _v;
  void _s;
  void _i;
  void _c;
  void _ch;

  return (
    <button type="button" {...rest} className={classes}>
      {content}
    </button>
  );
}

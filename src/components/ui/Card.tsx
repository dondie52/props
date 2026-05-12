import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  /** When set, the card root is a plain anchor (reliable in previews; same-origin navigation). */
  href?: string;
  /** Used with `href` for screen readers (e.g. stat tiles). */
  ariaLabel?: string;
};

const baseCardClass =
  "rounded-xl border border-border-ghost bg-bg-card p-6 shadow-card transition-all duration-200 hover:shadow-card-hover";

export default function Card({ children, className = "", href, ariaLabel }: CardProps) {
  const merged = `${baseCardClass} ${className}`.trim();

  if (href) {
    return (
      <a
        href={href}
        aria-label={ariaLabel}
        className={`${merged} block cursor-pointer text-inherit no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
      >
        {children}
      </a>
    );
  }

  return <div className={merged}>{children}</div>;
}

import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-large border border-border-ghost bg-bg-card p-6 shadow-card transition-shadow hover:shadow-md ${className}`}
    >
      {children}
    </div>
  );
}

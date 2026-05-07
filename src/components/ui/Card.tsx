import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-base border border-border-ghost bg-bg-card p-6 shadow-card ${className}`}
    >
      {children}
    </div>
  );
}

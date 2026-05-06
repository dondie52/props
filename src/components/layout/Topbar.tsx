import { Bell } from "lucide-react";

type TopbarProps = {
  title: string;
};

export default function Topbar({ title }: TopbarProps) {
  return (
    <header className="h-16 px-6 bg-bg-card border-b border-border-ghost flex items-center justify-between">
      <h1 className="text-text-main font-semibold text-lg">{title}</h1>

      <div className="flex items-center gap-3">
        <input
          type="search"
          placeholder="Search"
          className="h-9 w-48 rounded-base border border-border-ghost bg-bg-card px-3 text-sm text-text-main placeholder:text-text-muted focus:border-primary focus:outline-none"
        />

        <button
          type="button"
          aria-label="Notifications"
          className="h-9 w-9 rounded-base border border-border-ghost flex items-center justify-center text-text-muted hover:bg-bg-page"
        >
          <Bell className="size-4" />
        </button>

        <div className="h-9 w-9 rounded-pill bg-primary-mid text-white flex items-center justify-center text-sm font-medium">
          TS
        </div>
      </div>
    </header>
  );
}

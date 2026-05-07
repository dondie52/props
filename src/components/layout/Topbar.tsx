import { Bell, Menu, Search } from "lucide-react";

type TopbarProps = {
  title: string;
  onOpenSidebar?: () => void;
};

export default function Topbar({ title, onOpenSidebar }: TopbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border-ghost bg-bg-card px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button type="button" className="text-text-muted lg:hidden" onClick={onOpenSidebar} aria-label="Open sidebar">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-text-main">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="search"
          placeholder="Search"
          className="hidden h-9 w-48 rounded-base border border-border-ghost bg-bg-card px-3 text-sm text-text-main placeholder:text-text-muted focus:border-primary focus:outline-none md:block"
        />
        <button
          type="button"
          aria-label="Search"
          className="flex h-9 w-9 items-center justify-center rounded-base border border-border-ghost text-text-muted hover:bg-bg-page md:hidden"
        >
          <Search className="size-4" />
        </button>

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

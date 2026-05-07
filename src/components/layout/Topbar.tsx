import { Bell, Menu, Search } from "lucide-react";

type TopbarProps = {
  title: string;
  onOpenSidebar?: () => void;
};

export default function Topbar({ title, onOpenSidebar }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border-ghost bg-bg-card/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-page hover:text-text-main lg:hidden"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-text-main">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            placeholder="Search..."
            className="h-9 w-64 rounded-lg border border-border-muted bg-bg-page/50 pl-9 pr-3 text-sm transition-all focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5"
          />
        </div>

        <button
          type="button"
          aria-label="Search"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-page hover:text-text-main md:hidden"
        >
          <Search className="h-5 w-5" />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-page hover:text-text-main"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-2 pl-2">
          <div className="h-8 w-8 rounded-full bg-primary-mid text-white flex items-center justify-center text-xs font-semibold shadow-sm ring-2 ring-white">
            TS
          </div>
        </div>
      </div>
    </header>
  );
}

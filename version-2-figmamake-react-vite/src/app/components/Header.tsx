import { Button } from "./ui/button";

interface HeaderProps {
  onSignOut: () => void;
}

export function Header({ onSignOut }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2 sm:px-6 sm:py-3">
        <span className="text-sm font-semibold text-[#0033a0] sm:text-base">
          Corporate Academy
        </span>
        <Button
          variant="outline"
          className="h-7 px-2.5 text-xs sm:h-9 sm:px-4 sm:text-sm"
          onClick={onSignOut}
        >
          Sign Out
        </Button>
      </div>
    </header>
  );
}

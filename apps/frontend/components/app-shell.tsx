import type { ReactNode } from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="mx-auto min-h-screen max-w-[411px] bg-background pt-[5.45rem]">
      <header className="fixed left-0 right-0 top-0 z-50 bg-white">
        <div className="mx-auto flex h-[5.45rem] max-w-[411px] items-end justify-between px-4 pb-4">
          <div className="flex items-center">
            <img
              src="/jikgubom-logo.svg"
              alt="직구봄"
              className="h-12 w-[7.8rem] object-contain object-left"
            />
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              aria-label="검색"
              className="inline-flex size-9 items-center justify-center rounded-full text-primary transition-colors active:bg-secondary/70"
            >
              <Search className="h-[1.35rem] w-[1.35rem]" strokeWidth={1.95} />
            </button>
            <button
              type="button"
              aria-label="알림"
              className="inline-flex size-9 items-center justify-center rounded-full text-primary transition-colors active:bg-secondary/70"
            >
              <Bell className="h-[1.3rem] w-[1.3rem]" strokeWidth={1.95} />
            </button>
            <button
              type="button"
              aria-label="메뉴"
              className="inline-flex size-9 items-center justify-center rounded-full text-primary transition-colors active:bg-secondary/70"
            >
              <Menu className="h-[1.45rem] w-[1.45rem]" strokeWidth={1.95} />
            </button>
          </div>
        </div>
      </header>
      {children}
      <BottomNav />
    </main>
  );
}

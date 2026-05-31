'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CircleUserRound, Heart, HousePlus, UsersRound } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: '홈', icon: HousePlus },
  { href: '/favorites', label: '관심품목', icon: Heart },
  { href: '/groups', label: '그룹', icon: UsersRound },
  { href: '/mypage', label: '마이', icon: CircleUserRound },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#d8dce5] bg-white px-2 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-2">
      <div className="mx-auto grid max-w-[411px] grid-cols-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-h-[3.85rem] flex-col items-center justify-center gap-1 text-[0.92rem] leading-none transition-colors',
                isActive
                  ? 'font-medium text-primary'
                  : 'font-light text-primary/78 hover:text-primary'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              title={item.label}
            >
              <span className="relative flex h-7 w-7 items-center justify-center">
                {isActive && (
                  <span className="absolute inset-[3px] rounded-full bg-secondary" aria-hidden="true" />
                )}
                <item.icon
                  className="relative h-7 w-7 fill-transparent stroke-current transition-colors"
                  strokeWidth={isActive ? 2.05 : 1.8}
                />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

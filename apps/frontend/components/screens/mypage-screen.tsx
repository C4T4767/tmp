'use client';

import {
  Bell,
  ChevronRight,
  ClipboardList,
  LogOut,
  UserRound,
} from 'lucide-react';
import { mockCurrentUser } from '@/lib/mock-data';
import Link from 'next/link';

const menuItems = [
  { href: '/onboarding', label: '안전 프로필 수정', icon: ClipboardList },
];

export function MyPageScreen() {
  const user = mockCurrentUser;

  return (
    <div className="flex flex-col gap-5 p-4 pb-24">
      <header className="space-y-1.5">
        <p className="text-[0.74rem] font-medium text-muted-foreground">계정</p>
        <h1 className="text-[1.5rem] font-semibold leading-tight text-primary">마이페이지</h1>
      </header>

      <Link
        href="/mypage/nickname"
        className="flex items-center justify-between gap-3 rounded-[18px] bg-white/65 px-1 py-1"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-13 w-13 items-center justify-center rounded-full bg-white text-primary shadow-[0_6px_18px_rgba(10,37,64,0.07)]">
            <UserRound className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-[1.14rem] font-semibold text-primary">{user.nickname}</h2>
            <p className="mt-1 text-[0.78rem] font-medium text-muted-foreground">
              카카오로 연결됨
            </p>
          </div>
        </div>
        <ChevronRight className="h-4.5 w-4.5 shrink-0 text-primary/35" strokeWidth={2} />
      </Link>

      <section className="rounded-[18px] bg-white px-4 shadow-[0_8px_24px_rgba(10,37,64,0.05)]">
        <div className="divide-y divide-[#edf2f8]">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between gap-3 py-4 transition-colors active:bg-[#f8fbff]"
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-primary/72" strokeWidth={1.75} />
                <p className="text-[0.96rem] font-medium text-primary">{item.label}</p>
              </div>
              <ChevronRight className="h-4.5 w-4.5 shrink-0 text-primary/35" strokeWidth={2} />
            </Link>
          ))}

          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 py-4 text-left transition-colors active:bg-[#f8fbff]"
          >
            <span className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary/72" strokeWidth={1.75} />
              <span className="text-[0.96rem] font-medium text-primary">알림 설정</span>
            </span>
            <ChevronRight className="h-4.5 w-4.5 text-primary/35" strokeWidth={2} />
          </button>
        </div>
      </section>

      <Link
        href="/login"
        className="mx-auto mt-1 inline-flex items-center gap-1.5 px-2 py-1 text-[0.8rem] font-medium text-[#b42318]/72 transition-colors active:text-[#7a1a13]"
      >
        <LogOut className="h-4 w-4" strokeWidth={1.9} />
        로그아웃
      </Link>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { ChevronRight, Plus, UserPlus, UsersRound } from 'lucide-react';
import { mockGroups } from '@/lib/mock-data';
import Link from 'next/link';

export function GroupsScreen() {
  const [groups] = useState(mockGroups);

  return (
    <div className="flex flex-col gap-5 p-4 pb-24">
      <header className="space-y-1">
        <p className="text-[0.76rem] font-medium text-muted-foreground">함께 확인하는 안전 정보</p>
        <h1 className="text-[1.58rem] font-semibold leading-tight text-primary">그룹</h1>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/groups/create"
          className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#d9e3f2] bg-white text-[0.92rem] font-medium text-primary shadow-[0_8px_18px_rgba(10,37,64,0.08)] transition-transform active:scale-[0.98]"
        >
          <Plus className="h-4.5 w-4.5" strokeWidth={1.9} />
          그룹 추가
        </Link>
        <Link
          href="/groups/join"
          className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#d9e3f2] bg-white text-[0.92rem] font-medium text-primary shadow-[0_8px_18px_rgba(10,37,64,0.08)] transition-transform active:scale-[0.98]"
        >
          <UserPlus className="h-4.5 w-4.5" strokeWidth={1.9} />
          그룹 참가
        </Link>
      </div>

      <section className="space-y-3">
        {groups.map((group) => (
          <Link
            key={group.id}
            href={`/groups/${group.id}`}
            className="block rounded-[18px] border border-[#dce6f3] bg-white p-4 shadow-[0_8px_24px_rgba(10,37,64,0.07)] transition-transform active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#f2f7fd] text-primary">
                  <UsersRound className="h-5.5 w-5.5" strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-[1rem] font-semibold leading-tight text-primary">
                    {group.name}
                  </h2>
                  <p className="mt-1 text-[0.78rem] font-medium text-muted-foreground">
                    {group.memberCount}명 참여 중
                  </p>
                </div>
              </div>
              <ChevronRight className="mt-3 h-5 w-5 shrink-0 text-primary/45" strokeWidth={1.8} />
            </div>

            <div className="mt-4 flex gap-2">
              <span className="rounded-full bg-[#f4f7fb] px-2.5 py-1 text-[0.7rem] font-medium text-primary/72">
                성분 주의 공유
              </span>
              <span className="rounded-full bg-[#e8f8ef] px-2.5 py-1 text-[0.7rem] font-medium text-[#12814d]">
                안전 확인
              </span>
            </div>
          </Link>
        ))}
      </section>

      {groups.length === 0 && (
        <div className="rounded-[18px] border border-[#dce6f3] bg-white p-8 text-center shadow-[0_8px_24px_rgba(10,37,64,0.06)]">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#f2f7fd]">
            <UsersRound className="h-6 w-6 text-primary" />
          </div>
          <p className="mt-4 font-semibold text-primary">참여 중인 그룹이 없어요.</p>
          <p className="mt-1 text-[0.82rem] text-muted-foreground">
            그룹을 만들거나 초대 코드로 참가해보세요.
          </p>
        </div>
      )}
    </div>
  );
}

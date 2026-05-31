'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Copy,
  MessageCircle,
  Trash2,
  UserPlus,
  UsersRound,
} from 'lucide-react';
import { mockGroups, mockGroupMembers } from '@/lib/mock-data';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface GroupDetailScreenProps {
  groupId: string;
}

export function GroupDetailScreen({ groupId }: GroupDetailScreenProps) {
  const group = mockGroups.find((g) => g.id === groupId) ?? mockGroups[0];
  const [members] = useState(mockGroupMembers);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(group.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5 p-4 pb-24">
      <header className="space-y-4">
        <Link
          href="/groups"
          aria-label="그룹 목록으로 돌아가기"
          className="inline-flex w-fit items-center gap-1.5 text-[0.86rem] font-medium text-primary/72 transition-colors active:text-primary"
        >
          <ArrowLeft className="h-4.5 w-4.5" strokeWidth={1.9} />
          이전
        </Link>
        <div>
          <p className="text-[0.76rem] font-medium text-muted-foreground">그룹 안전 프로필</p>
          <h1 className="mt-1 text-[1.58rem] font-semibold leading-tight text-primary">{group.name}</h1>
          <p className="mt-1 text-[0.84rem] font-medium text-muted-foreground">
            {group.memberCount}명이 함께 성분 정보를 확인하고 있어요.
          </p>
        </div>
      </header>

      <section className="rounded-[18px] border border-[#dce6f3] bg-white p-4 shadow-[0_8px_24px_rgba(10,37,64,0.07)]">
        <div className="rounded-[16px] bg-[#f8fbff] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.76rem] font-medium text-muted-foreground">초대 코드</p>
              <p className="mt-1 font-mono text-[1.42rem] font-bold tracking-[0.08em] text-primary">
                {group.inviteCode}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className={cn(
                'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[0.78rem] font-semibold transition-transform active:scale-[0.96]',
                copied
                  ? 'border-[#bcebd0] bg-[#e8f8ef] text-[#12814d]'
                  : 'border-[#d9e3f2] bg-white text-primary'
              )}
            >
              {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? '복사됨' : '복사'}
            </button>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e9f1fb]">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${Math.min(100, Math.round((group.onboardedCount / group.memberCount) * 100))}%`,
              }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[0.76rem] font-medium">
            <span className="text-muted-foreground">온보딩 완료</span>
            <span className="text-primary">
              {group.onboardedCount}/{group.memberCount}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="mt-3 flex w-full items-center justify-between rounded-[16px] border border-[#f4df4d]/65 bg-[#fffbe0] p-3.5 text-left transition-transform active:scale-[0.985]"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fee500] text-[#191600]">
              <MessageCircle className="h-4.5 w-4.5" strokeWidth={2} />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.92rem] font-semibold text-primary">
                카카오로 구성원 초대
              </span>
              <span className="mt-0.5 block truncate text-[0.74rem] font-medium text-primary/58">
                초대코드와 그룹 링크를 함께 보내요
              </span>
            </span>
          </span>
          <ChevronRight className="h-4.5 w-4.5 shrink-0 text-primary/45" strokeWidth={2} />
        </button>
      </section>

      <div>
        <button
          type="button"
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-[0.94rem] font-semibold text-white shadow-[0_10px_20px_rgba(10,37,64,0.14)] transition-transform active:scale-[0.98]"
        >
          <UserPlus className="h-5 w-5" strokeWidth={1.9} />
          그룹원 추가
        </button>
      </div>

      <section className="rounded-[18px] border border-[#dce6f3] bg-white p-4 shadow-[0_8px_24px_rgba(10,37,64,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[1rem] font-semibold text-primary">그룹원</h2>
          <span className="rounded-full bg-secondary/70 px-2.5 py-1 text-[0.72rem] font-semibold text-primary">
            {members.length}명
          </span>
        </div>
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-2xl bg-[#f8fbff] p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-[0_6px_14px_rgba(10,37,64,0.08)]">
                  <UsersRound className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <span className="truncate text-[0.95rem] font-medium text-primary">
                  {member.nickname}
                </span>
              </div>
              <span
                className={cn(
                  'rounded-full px-2.5 py-1 text-[0.72rem] font-semibold',
                  member.isOnboarded
                    ? 'bg-[#e8f8ef] text-[#12814d]'
                    : 'bg-[#eef4fc] text-muted-foreground'
                )}
              >
                {member.isOnboarded ? '완료' : '미완료'}
              </span>
            </div>
          ))}
        </div>
      </section>

      <button
        type="button"
        className="mx-auto inline-flex items-center gap-1.5 px-2 py-1 text-[0.78rem] font-medium text-[#b42318]/78 transition-colors active:text-[#7a1a13]"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
        그룹 삭제
      </button>
    </div>
  );
}

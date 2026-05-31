'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Loader2,
  Search,
  UsersRound,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface SearchResult {
  id: string;
  name: string;
  leaderName: string;
  memberCount: number;
}

export function GroupJoinScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [joinedId, setJoinedId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSearchResults([
      { id: '3', name: '건강 관리 모임', leaderName: '이영희', memberCount: 12 },
      { id: '4', name: '영양제 연구회', leaderName: '박지성', memberCount: 25 },
    ]);
    setIsSearching(false);
  };

  const handleJoin = async (groupId: string) => {
    setIsJoining(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setJoinedId(groupId);
    setIsJoining(false);
  };

  const handleUseExample = () => {
    setSearchQuery('SAFE2026');
    setSearchResults([
      { id: 'safe-2026', name: '직구 안전 모임', leaderName: '김싸피', memberCount: 6 },
    ]);
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
          <p className="text-[0.76rem] font-medium text-muted-foreground">초대 코드 또는 그룹명</p>
          <h1 className="mt-1 text-[1.58rem] font-semibold leading-tight text-primary">그룹 참가</h1>
          <p className="mt-1 text-[0.84rem] font-medium leading-5 text-muted-foreground">
            함께 관리할 그룹을 찾아 가입 신청을 보내요.
          </p>
        </div>
      </header>

      <form
        onSubmit={handleSearch}
        className="rounded-[18px] border border-[#dce6f3] bg-white p-3 shadow-[0_8px_24px_rgba(10,37,64,0.07)]"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/45" />
          <Input
            type="text"
            placeholder="그룹명 또는 초대코드"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 rounded-[16px] border-[#d9e3f2] bg-[#f8fbff] pl-11 pr-4 text-[0.95rem] shadow-none focus-visible:ring-2 focus-visible:ring-accent/35"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching || !searchQuery.trim()}
          className="mt-3 flex h-11 w-full items-center justify-center rounded-full bg-primary text-[0.94rem] font-semibold text-white shadow-[0_10px_20px_rgba(10,37,64,0.14)] transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-primary/35 disabled:shadow-none"
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : '검색'}
        </button>
      </form>

      {!searchQuery && searchResults.length === 0 && (
        <button
          type="button"
          onClick={handleUseExample}
          className="flex items-center justify-between rounded-[18px] border border-[#dce6f3] bg-white px-4 py-3 text-left shadow-[0_8px_24px_rgba(10,37,64,0.05)] transition-transform active:scale-[0.99]"
        >
          <span>
            <span className="block text-[0.82rem] font-medium text-muted-foreground">예시 초대코드</span>
            <span className="mt-0.5 block font-mono text-[1rem] font-semibold tracking-[0.06em] text-primary">
              SAFE2026
            </span>
          </span>
          <span className="text-[0.8rem] font-medium text-primary/55">입력</span>
        </button>
      )}

      {searchResults.length > 0 && (
        <section className="space-y-3">
          <p className="px-1 text-[0.82rem] font-medium text-muted-foreground">
            {searchResults.length}개의 그룹을 찾았습니다
          </p>
          {searchResults.map((group) => (
            <div
              key={group.id}
              className="rounded-[18px] border border-[#dce6f3] bg-white p-4 shadow-[0_8px_24px_rgba(10,37,64,0.06)]"
            >
              {joinedId === group.id ? (
                <div className="flex items-center gap-3 text-[#12814d]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f8ef]">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <span className="font-semibold">가입 신청이 완료되었습니다.</span>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#f2f7fd] text-primary">
                      <UsersRound className="h-5.5 w-5.5" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-[1.02rem] font-semibold text-primary">
                        {group.name}
                      </h2>
                      <p className="mt-1 text-[0.78rem] font-medium text-muted-foreground">
                        {group.leaderName} · {group.memberCount}명
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleJoin(group.id)}
                    disabled={isJoining}
                    className="flex h-10 shrink-0 items-center gap-1 rounded-full bg-primary px-3 text-[0.78rem] font-semibold text-white transition-transform active:scale-[0.96] disabled:bg-primary/35"
                  >
                    {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : '신청'}
                    {!isJoining && <ChevronRight className="h-4 w-4" />}
                  </button>
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {searchQuery && searchResults.length === 0 && !isSearching && (
        <div className="rounded-[18px] border border-[#dce6f3] bg-white p-8 text-center shadow-[0_8px_24px_rgba(10,37,64,0.06)]">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#f2f7fd]">
            <UsersRound className="h-6 w-6 text-primary" />
          </div>
          <p className="mt-4 font-semibold text-primary">검색 결과가 없어요.</p>
          <p className="mt-1 text-[0.82rem] text-muted-foreground">
            다른 그룹명이나 초대코드를 입력해보세요.
          </p>
        </div>
      )}
    </div>
  );
}

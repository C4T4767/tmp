'use client';

import { useState } from 'react';
import { ArrowLeft, Loader2, UsersRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function GroupCreateScreen() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    
    setIsCreating(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsCreating(false);
    router.push('/groups/1');
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
          <p className="text-[0.76rem] font-medium text-muted-foreground">새 안전 그룹</p>
          <h1 className="mt-1 text-[1.58rem] font-semibold leading-tight text-primary">그룹 만들기</h1>
          <p className="mt-1 text-[0.84rem] font-medium leading-5 text-muted-foreground">
            가족이나 친구와 함께 해외직구 성분 주의 정보를 확인해요.
          </p>
        </div>
      </header>

      <section className="rounded-[18px] border border-[#dce6f3] bg-white p-4 shadow-[0_8px_24px_rgba(10,37,64,0.07)]">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#f2f7fd] text-primary">
          <UsersRound className="h-5.5 w-5.5" strokeWidth={1.8} />
        </div>
        <label htmlFor="groupName" className="text-[0.82rem] font-semibold text-primary">
          그룹명
        </label>
        <Input
          id="groupName"
          placeholder="예) 우리 가족"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="mt-2 h-12 rounded-[16px] border-[#d9e3f2] bg-[#f8fbff] px-4 text-[0.95rem] shadow-none focus-visible:ring-2 focus-visible:ring-accent/35"
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={!groupName.trim() || isCreating}
          className="mt-5 flex h-11 w-full items-center justify-center rounded-full bg-primary text-[0.94rem] font-semibold text-white shadow-[0_10px_20px_rgba(10,37,64,0.14)] transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-primary/35 disabled:shadow-none"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              생성 중
            </>
          ) : (
            '그룹 생성'
          )}
        </button>
      </section>

      <div className="rounded-[16px] border border-[#d9e3f2] bg-[#f7fbff] p-4">
        <p className="text-[0.82rem] font-medium leading-5 text-primary/75">
          그룹원이 온보딩을 완료하면 연령대, 민감 성분, 카페인 주의 여부를 함께 반영해요.
        </p>
      </div>
    </div>
  );
}

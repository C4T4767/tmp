'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

function JikguBomLogo() {
  return (
    <img
      src="/jikgubom-logo.svg"
      alt="직구봄"
      className="mx-auto h-auto w-[15.75rem] drop-shadow-[0_16px_28px_rgba(10,37,64,0.13)]"
    />
  );
}

function KakaoIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.76 1.84 5.18 4.6 6.58-.2.76-.76 2.76-.88 3.2-.12.44.16.44.34.32.14-.08 2.24-1.52 3.14-2.14.58.08 1.18.12 1.8.12 5.52 0 10-3.48 10-7.78S17.52 3 12 3Z" />
    </svg>
  );
}

export function LoginScreen() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9fe_44%,#e8f1fa_100%)] px-6 py-8">
      <div className="absolute inset-x-6 top-6 h-px bg-white/80" />
      <div className="relative flex flex-1 flex-col items-center justify-center gap-11">
        <div className="w-full text-center">
          <JikguBomLogo />
          <h1 className="mt-10 whitespace-nowrap text-[1.18rem] font-extrabold leading-tight text-primary">
            해외 직구, 안전하고 똑똑하게
          </h1>
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            성분부터 가격까지 한 번에 확인하세요.
          </p>
        </div>

        <div className="w-full max-w-sm">
          <Button
            asChild
            className="h-14 w-full rounded-md bg-[#FEE500] text-base font-bold text-[#191919] shadow-[0_10px_24px_rgba(10,37,64,0.12)] hover:bg-[#FDD800]"
          >
            <Link href="/onboarding">
              <KakaoIcon />
              카카오 로그인
            </Link>
          </Button>
          <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
            로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}

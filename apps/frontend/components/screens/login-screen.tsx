'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export function LoginScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-primary">SafeBuy</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            카카오 로그인으로 안전한 해외직구 관리를 시작하세요.
          </p>
        </div>

        {/* Kakao Login */}
        <Card>
          <CardContent className="p-4">
            <Button
              asChild
              className="w-full bg-[#FEE500] text-[#191919] hover:bg-[#FDD800]"
            >
              <Link href="/signup">
                <svg
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.76 1.84 5.18 4.6 6.58-.2.76-.76 2.76-.88 3.2-.12.44.16.44.34.32.14-.08 2.24-1.52 3.14-2.14.58.08 1.18.12 1.8.12 5.52 0 10-3.48 10-7.78S17.52 3 12 3z" />
                </svg>
                카카오로 로그인
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}

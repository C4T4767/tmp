'use client';

import { ChevronRight, LogOut, Edit, FileText, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { mockCurrentUser } from '@/lib/mock-data';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/mypage/nickname', label: '닉네임 변경', icon: Edit },
  { href: '/onboarding', label: '온보딩 수정', icon: ClipboardList },
  { href: '/mypage/comments', label: '내 댓글 목록', icon: FileText },
];

export function MyPageScreen() {
  const user = mockCurrentUser;

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Header */}
      <h1 className="text-xl font-bold text-foreground">마이페이지</h1>

      {/* User Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <span className="text-2xl font-bold text-primary">
                {user.nickname.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{user.nickname}</h2>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  user.isOnboarded
                    ? 'bg-success/10 text-success'
                    : 'bg-warning/10 text-warning-foreground'
                )}
              >
                온보딩 {user.isOnboarded ? '완료' : '미완료'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu */}
      <Card>
        <CardContent className="p-0">
          {menuItems.map((item, idx) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted',
                idx !== menuItems.length - 1 && 'border-b border-border'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-foreground">{item.label}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Logout */}
      <Button asChild variant="outline" className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground">
        <Link href="/login">
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </Link>
      </Button>
    </div>
  );
}

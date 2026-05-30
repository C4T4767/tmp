'use client';

import { useState } from 'react';
import { ArrowLeft, Copy, UserPlus, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/groups">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">{group.name}</h1>
          <p className="text-sm text-muted-foreground">{group.memberCount}명</p>
        </div>
      </div>

      {/* Invite Code */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">초대 코드</p>
              <p className="font-mono text-lg font-bold text-primary">{group.inviteCode}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyCode}
              className={cn(copied && 'text-success border-success')}
            >
              {copied ? (
                <>
                  <CheckCircle className="mr-1 h-4 w-4" />
                  복사됨
                </>
              ) : (
                <>
                  <Copy className="mr-1 h-4 w-4" />
                  복사하기
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button className="flex-1">
          <UserPlus className="mr-2 h-4 w-4" />
          그룹원 추가
        </Button>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          그룹 삭제
        </Button>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">그룹원 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
              >
                <span className="font-medium text-foreground">{member.nickname}</span>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs font-medium',
                    member.isOnboarded
                      ? 'bg-success/10 text-success'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {member.isOnboarded ? '완료' : '미완료'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

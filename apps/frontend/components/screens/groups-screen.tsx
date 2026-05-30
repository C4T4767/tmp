'use client';

import { useState } from 'react';
import { Plus, UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { mockGroups } from '@/lib/mock-data';
import Link from 'next/link';

export function GroupsScreen() {
  const [groups] = useState(mockGroups);

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">내 그룹</h1>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/groups/create">
              <Plus className="mr-1 h-4 w-4" />
              그룹 추가
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/groups/join">
              <UserPlus className="mr-1 h-4 w-4" />
              그룹 참가
            </Link>
          </Button>
        </div>
      </div>

      {/* Groups List */}
      <div className="flex flex-col gap-3">
        {groups.map((group) => (
          <Card key={group.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{group.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {group.memberCount}명 · 온보딩 {group.onboardedCount}명 완료
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/groups/${group.id}`}>그룹 보기</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">아직 참여중인 그룹이 없습니다.</p>
          <p className="text-sm text-muted-foreground">
            그룹을 만들거나 초대 코드로 참가해보세요.
          </p>
        </div>
      )}
    </div>
  );
}

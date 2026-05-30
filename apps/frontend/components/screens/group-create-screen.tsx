'use client';

import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/groups">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">그룹 만들기</h1>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">새 그룹 정보</CardTitle>
          <CardDescription>
            가족이나 친구들과 함께 성분 안전성을 확인할 수 있는 그룹을 만들어보세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">그룹명</Label>
              <Input
                id="groupName"
                placeholder="그룹명을 입력하세요"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={!groupName.trim() || isCreating}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                '그룹 생성'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

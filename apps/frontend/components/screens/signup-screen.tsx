'use client';

import { useState } from 'react';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const healthOptions = [
  { id: 'pregnant', label: '임신' },
  { id: 'hypertension', label: '고혈압' },
  { id: 'hyperlipidemia', label: '고지혈증' },
  { id: 'diabetes', label: '당뇨' },
  { id: 'caffeine', label: '카페인 민감' },
];

export function SignupScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState('카카오사용자');
  const [selectedHealthOptions, setSelectedHealthOptions] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleHealthOption = (optionId: string) => {
    setSelectedHealthOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleNext = async () => {
    if (!nickname.trim()) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    router.push('/');
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/login">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">회원가입</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">기본 정보</CardTitle>
          <CardDescription>
            카카오 계정의 닉네임을 기본으로 가져왔습니다. 원하시면 수정할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                placeholder="닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">안전 확인 정보</CardTitle>
          </div>
          <CardDescription>
            해당하는 항목을 선택하면 상품 성분 주의 여부를 더 정확히 확인합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {healthOptions.map((option) => (
              <Label
                key={option.id}
                htmlFor={option.id}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
              >
                <Checkbox
                  id={option.id}
                  checked={selectedHealthOptions.includes(option.id)}
                  onCheckedChange={() => toggleHealthOption(option.id)}
                />
                <span>{option.label}</span>
              </Label>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="additionalNotes">추가 정보</Label>
            <Textarea
              id="additionalNotes"
              placeholder="주의해야 할 성분이나 복용 중인 약을 입력하세요"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleNext}
        disabled={!nickname.trim() || isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            가입 중...
          </>
        ) : (
          '가입하고 시작하기'
        )}
      </Button>
    </div>
  );
}

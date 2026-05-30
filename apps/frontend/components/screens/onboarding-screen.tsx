'use client';

import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const healthOptions = [
  { id: 'pregnant', label: '임산부 여부' },
  { id: 'breastfeeding', label: '수유 여부' },
  { id: 'child', label: '어린이 여부' },
  { id: 'elderly', label: '고령자 여부' },
  { id: 'caffeine', label: '카페인 민감 여부' },
  { id: 'allergies', label: '특정 성분 주의 여부' },
];

export function OnboardingScreen() {
  const router = useRouter();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleOption = (optionId: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    router.push('/');
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/signup">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">맞춤 안전 확인을 위한 정보 입력</h1>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground">
        입력한 정보는 상품 성분 위험 여부를 판단하는 데 사용됩니다.
      </p>

      {/* Health Options */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">건강 정보 선택</CardTitle>
          <CardDescription>
            해당하는 항목을 모두 선택해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {healthOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-3">
                <Checkbox
                  id={option.id}
                  checked={selectedOptions.includes(option.id)}
                  onCheckedChange={() => toggleOption(option.id)}
                />
                <Label
                  htmlFor={option.id}
                  className="cursor-pointer font-normal"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">추가 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="주의해야 할 성분이나 건강 상태를 입력하세요"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        onClick={handleSave}
        disabled={isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            저장 중...
          </>
        ) : (
          '저장하고 시작하기'
        )}
      </Button>
    </div>
  );
}

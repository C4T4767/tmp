'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Link2,
  Clipboard,
  CheckCircle,
  Loader2,
  Search,
  ShieldCheck,
  Store,
  FileSearch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const analysisSteps = [
  { label: '상품 정보 수집', icon: Store },
  { label: '성분 추출', icon: FileSearch },
  { label: '공공데이터 안전 검증', icon: ShieldCheck },
  { label: '대체 판매처 탐색', icon: Search },
  { label: '매칭 완료', icon: CheckCircle },
];

export function ImportScreen() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [result, setResult] = useState<{
    name: string;
    status: string;
    storeCount: number;
    lowestTotalPrice: number;
    matchedStores: string[];
    unmatchedStores: string[];
  } | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    
    setIsAnalyzing(true);
    setResult(null);
    setCurrentStep(0);

    for (let step = 0; step < analysisSteps.length; step += 1) {
      setCurrentStep(step);
      await new Promise((resolve) => setTimeout(resolve, 450));
    }

    setResult({
      name: 'California Gold Nutrition Gold C 비타민 C 1,000mg',
      status: '분석 완료',
      storeCount: 2,
      lowestTotalPrice: 23000,
      matchedStores: ['iHerb', 'Coupang'],
      unmatchedStores: ['Amazon', '11번가'],
    });
    setCurrentStep(analysisSteps.length);
    setIsAnalyzing(false);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch {
      console.log('[v0] Clipboard access denied');
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">상품 링크로 분석하기</h1>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Link2 className="h-5 w-5 text-primary" />
            URL로 상품 분석
          </CardTitle>
          <CardDescription>
            상품 정보와 성분을 확인한 뒤 비교 가능한 판매처를 찾아드립니다.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4">
          <Input
            type="url"
            placeholder="상품 URL을 붙여넣으세요"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Button
              onClick={handleAnalyze}
              disabled={!url.trim() || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  분석 중...
                </>
              ) : (
                '분석하기'
              )}
            </Button>
            <Button variant="outline" size="icon" onClick={handlePasteFromClipboard}>
              <Clipboard className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAnalyzing}>
        <DialogContent
          showCloseButton={false}
          className="w-[calc(100%-3rem)] max-w-[21rem] rounded-md border-0 bg-white px-8 py-10 shadow-2xl"
        >
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-xl font-semibold leading-7 text-primary">
              상품을 분석하고 있습
              <br />
              니다...
            </DialogTitle>
            <DialogDescription className="sr-only">
              상품 링크 분석 진행 상태입니다.
            </DialogDescription>
          </DialogHeader>

          <div className="mx-auto mt-14 w-full max-w-[12.5rem]">
            <div className="flex flex-col gap-5">
              {analysisSteps.map((step, index) => {
                const isDone = currentStep > index;
                const isCurrent = currentStep === index;

                return (
                  <div key={step.label} className="grid grid-cols-[1.25rem_1fr] items-center gap-4">
                    <span
                      className={cn(
                        'relative flex size-5 items-center justify-center rounded-full',
                        isDone && 'bg-[#6da6cf] text-white',
                        isCurrent && 'border-[5px] border-primary bg-white',
                        !isDone && !isCurrent && 'bg-secondary text-primary/20'
                      )}
                    >
                      {isDone && <CheckCircle className="h-3.5 w-3.5" />}
                      {!isDone && !isCurrent && (
                        <span className="size-1.5 rounded-full bg-primary/10" />
                      )}
                    </span>
                    <span
                      className={cn(
                        'text-sm',
                        (isDone || isCurrent)
                          ? 'font-semibold text-primary'
                          : 'font-medium text-muted-foreground'
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-14 border-t border-border pt-5 text-center">
              <p className="text-[11px] text-muted-foreground">
                약 5~10초 내외로 분석이 완료됩니다.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {result && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-success" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{result.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{result.status}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-success/20 bg-background p-2">
                    <p className="text-xs text-muted-foreground">검증 판매처</p>
                    <p className="mt-1 text-sm font-bold text-foreground">{result.storeCount}곳</p>
                  </div>
                  <div className="rounded-md border border-success/20 bg-background p-2">
                    <p className="text-xs text-muted-foreground">최저가</p>
                    <p className="mt-1 text-sm font-bold text-primary">
                      {result.lowestTotalPrice.toLocaleString()}원
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <p>매칭됨: {result.matchedStores.join(', ')}</p>
                  <p>매칭 없음: {result.unmatchedStores.join(', ')}</p>
                </div>
                <Button asChild size="sm" className="mt-3">
                  <Link href="/product/1">상세페이지 보기</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}

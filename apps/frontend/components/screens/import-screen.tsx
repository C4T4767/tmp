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
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const analysisSteps = [
  { event: 'STORE_DETECTED', label: '쇼핑몰 확인', icon: Store },
  { event: 'SOURCE_CRAWLED', label: '원본 상품 정보 수집', icon: Link2 },
  { event: 'INGREDIENTS_EXTRACTED', label: '성분 추출', icon: FileSearch },
  { event: 'SAFETY_ANALYZED', label: '공공데이터 안전 분석', icon: ShieldCheck },
  { event: 'PRICE_CANDIDATES_SEARCHED', label: '다른 쇼핑몰 가격 후보 검색', icon: Search },
  { event: 'OFFERS_MATCHED', label: '같은 상품 여부 검증', icon: CheckCircle },
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

      {(isAnalyzing || result) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">분석 진행 상태</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {analysisSteps.map((step, index) => {
                const Icon = step.icon;
                const isDone = currentStep > index || Boolean(result);
                const isCurrent = isAnalyzing && currentStep === index;

                return (
                  <div key={step.label} className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border',
                        isDone && 'border-success bg-success text-success-foreground',
                        isCurrent && 'border-primary bg-primary/10 text-primary',
                        !isDone && !isCurrent && 'border-border bg-muted text-muted-foreground'
                      )}
                    >
                      {isDone ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : isCurrent ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-sm',
                        (isDone || isCurrent) ? 'font-medium text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {step.label}
                    </span>
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      {step.event}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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

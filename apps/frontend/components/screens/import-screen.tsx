'use client';

import { useState } from 'react';
import {
  ChevronLeft,
  Link2,
  CheckCircle,
  Loader2,
  Search,
  Store,
  FileSearch,
} from 'lucide-react';
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
  { label: '안전 기준 확인', icon: CheckCircle },
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
    imageUrl: string;
    matchedOffers: {
      store: string;
      price: number;
      shipping: number;
    }[];
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
      imageUrl: '/product-images/california-gold-vitamin-c.jpg',
      matchedOffers: [
        { store: 'iHerb', price: 18500, shipping: 4500 },
        { store: 'Coupang', price: 19900, shipping: 3000 },
      ],
    });
    setCurrentStep(analysisSteps.length);
    setIsAnalyzing(false);
  };

  return (
    <div className="flex flex-col gap-5 p-4 pb-24">
      <header className="space-y-4">
        <Link
          href="/"
          aria-label="홈으로 돌아가기"
          className="inline-flex w-fit items-center gap-1.5 text-[0.86rem] font-medium text-primary/72 transition-colors active:text-primary"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={1.9} />
        </Link>
        <div className="space-y-1.5">
          <p className="text-[0.74rem] font-medium text-muted-foreground">링크 분석</p>
          <h1 className="text-[1.5rem] font-semibold leading-tight text-primary">
            상품 링크로 분석하기
          </h1>
          <p className="text-[0.84rem] font-medium leading-5 text-muted-foreground">
            상품 URL을 붙여넣으면 정보와 성분을 확인해요.
          </p>
        </div>
      </header>

      <section className="rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(10,37,64,0.05)]">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f7fa] text-primary/82">
            <Link2 className="h-5 w-5" strokeWidth={1.85} />
          </span>
          <div>
            <h2 className="text-[0.98rem] font-semibold text-primary">URL로 상품 분석</h2>
            <p className="mt-0.5 text-[0.76rem] font-medium text-muted-foreground">
              iHerb, Amazon 등 상품 링크를 지원해요.
            </p>
          </div>
        </div>
        <div>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Input
              type="url"
              placeholder="상품 URL 입력"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-12 rounded-[16px] border-[#d9e3f2] bg-[#f8fbff] px-4 text-[0.95rem] shadow-none focus-visible:ring-2 focus-visible:ring-accent/35"
            />
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!url.trim() || isAnalyzing}
              className="flex h-12 shrink-0 items-center justify-center rounded-[16px] bg-primary px-4 text-[0.9rem] font-semibold text-white shadow-[0_10px_20px_rgba(10,37,64,0.14)] transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-primary/35 disabled:shadow-none"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                '확인'
              )}
            </button>
          </div>
        </div>
      </section>

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
        <section className="rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(10,37,64,0.05)]">
          <div className="grid grid-cols-[5.25rem_minmax(0,1fr)] gap-3">
            <div className="flex h-[5.25rem] w-[5.25rem] items-center justify-center overflow-hidden rounded-[18px] bg-[#f8fbff]">
              <img
                src={result.imageUrl}
                alt={`${result.name} 상품 이미지`}
                className="h-full w-full object-contain p-2"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <p className="line-clamp-2 font-semibold leading-snug text-primary">{result.name}</p>
              <p className="mt-1 text-[0.78rem] font-medium text-[#12814d]">{result.status}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-[0.86rem] font-semibold text-primary">매칭된 판매처</h2>
              <span className="text-[0.72rem] font-medium text-muted-foreground">
                {result.matchedOffers.length}곳
              </span>
            </div>
            {result.matchedOffers.map((offer) => {
              const totalPrice = offer.price + offer.shipping;

              return (
                <div
                  key={offer.store}
                  className="flex items-center justify-between rounded-[14px] bg-[#f8fbff] px-3 py-2.5"
                >
                  <div>
                    <p className="text-[0.88rem] font-semibold text-primary">{offer.store}</p>
                    <p className="mt-0.5 text-[0.72rem] font-medium text-muted-foreground">
                      상품 {offer.price.toLocaleString()}원 · 배송 {offer.shipping.toLocaleString()}원
                    </p>
                  </div>
                  <p className="shrink-0 text-[0.94rem] font-semibold text-primary">
                    {totalPrice.toLocaleString()}원
                  </p>
                </div>
              );
            })}
          </div>

          <Link
            href="/product/1"
            className="mt-4 flex h-10 items-center justify-center rounded-full bg-primary text-[0.86rem] font-semibold text-white"
          >
            분석결과 보기
          </Link>
        </section>
      )}

    </div>
  );
}

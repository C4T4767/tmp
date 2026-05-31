'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Link as LinkIcon,
  Package,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { SafetyBadge } from '@/components/safety-badge';
import Link from 'next/link';
import { mockProducts } from '@/lib/mock-data';
import { getPurchaseConfirmationPreference } from '@/lib/preference-storage';
import { cn } from '@/lib/utils';

const supportedShoppingMalls = [
  { name: '네이버 쇼핑', shortName: 'N', url: 'https://search.shopping.naver.com', className: 'bg-[#36c95f]' },
  { name: '쿠팡', shortName: 'Coupang', url: 'https://www.coupang.com', className: 'bg-[#d73a31]' },
  { name: '아마존', shortName: 'a', url: 'https://www.amazon.com', className: 'bg-[#c39a66]' },
  { name: '이베이', shortName: 'ebay', url: 'https://www.ebay.com', className: 'bg-white text-[#4b78d8]' },
  { name: '아이허브', shortName: 'iHerb', url: 'https://kr.iherb.com', className: 'bg-[#5a8f30]' },
  { name: '비타트라', shortName: '', url: 'https://www.vitatra.com', className: 'bg-[#58a373]' },
  { name: '오플닷컴', shortName: '', url: 'https://www.ople.com', className: 'bg-[#f28b2f]' },
];

const realtimeSearchKeywords = [
  { productId: '1', name: 'Nature Made 멀티비타민' },
  { productId: '2', name: 'NOW Foods 오메가-3' },
  { productId: '3', name: 'Swanson 프로바이오틱스' },
  { productId: '4', name: 'California Gold 비타민 C' },
  { productId: '5', name: 'Garden of Life 프로틴' },
  { productId: '1', name: 'Nature Made 비타민 D' },
  { productId: '2', name: 'NOW Foods 밀크시슬' },
  { productId: '4', name: 'California Gold 마그네슘' },
  { productId: '5', name: 'Garden of Life 콜라겐' },
  { productId: '3', name: 'Swanson 루테인' },
];

const mockPurchaseConfirmationChecks = [
  {
    id: 'purchase-check-1',
    productName: 'Nature Made 멀티비타민',
    storeName: 'iHerb',
    totalPrice: 30400,
  },
  {
    id: 'purchase-check-2',
    productName: 'California Gold 비타민 C',
    storeName: 'Amazon',
    totalPrice: 24900,
  },
  {
    id: 'purchase-check-3',
    productName: 'NOW Foods 오메가-3',
    storeName: '쿠팡',
    totalPrice: 37500,
  },
];

export function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [purchaseConfirmationChecks, setPurchaseConfirmationChecks] = useState(
    mockPurchaseConfirmationChecks
  );
  const [isPurchasePreferenceLoaded, setIsPurchasePreferenceLoaded] = useState(false);
  const [isPurchaseConfirmationEnabled, setIsPurchaseConfirmationEnabled] = useState(true);
  const [purchaseCarouselApi, setPurchaseCarouselApi] = useState<CarouselApi>();
  const [selectedPurchaseIndex, setSelectedPurchaseIndex] = useState(0);
  const currentPurchaseConfirmationCheck = purchaseConfirmationChecks[selectedPurchaseIndex];
  const shouldShowPurchaseDialog =
    isPurchasePreferenceLoaded &&
    isPurchaseConfirmationEnabled &&
    purchaseConfirmationChecks.length > 0;

  useEffect(() => {
    setIsPurchaseConfirmationEnabled(getPurchaseConfirmationPreference());
    setIsPurchasePreferenceLoaded(true);
  }, []);

  useEffect(() => {
    if (!purchaseCarouselApi) {
      return;
    }

    const updateSelectedIndex = () => {
      setSelectedPurchaseIndex(purchaseCarouselApi.selectedScrollSnap());
    };

    updateSelectedIndex();
    purchaseCarouselApi.on('select', updateSelectedIndex);
    purchaseCarouselApi.on('reInit', updateSelectedIndex);

    return () => {
      purchaseCarouselApi.off('select', updateSelectedIndex);
    };
  }, [purchaseCarouselApi]);

  useEffect(() => {
    if (purchaseConfirmationChecks.length === 0) {
      setSelectedPurchaseIndex(0);
      return;
    }

    if (selectedPurchaseIndex > purchaseConfirmationChecks.length - 1) {
      const nextIndex = purchaseConfirmationChecks.length - 1;
      setSelectedPurchaseIndex(nextIndex);
      purchaseCarouselApi?.scrollTo(nextIndex);
    }
  }, [purchaseConfirmationChecks.length, purchaseCarouselApi, selectedPurchaseIndex]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleResolvePurchaseConfirmation = (checkId: string) => {
    setPurchaseConfirmationChecks((currentChecks) =>
      currentChecks.filter((check) => check.id !== checkId)
    );
  };

  const handlePasteImportUrl = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setImportUrl(text);
    } catch {
      console.log('[v0] Clipboard access denied');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">SafeBuy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          해외직구 상품, 구매 전에 성분 안전성을 확인하세요.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="상품명을 입력하세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">검색</Button>
      </form>

      {shouldShowPurchaseDialog && (
        <Dialog open>
          <DialogContent showCloseButton={false} className="max-w-[calc(100%-2rem)] rounded-xl">
            <DialogHeader className="text-left">
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle className="h-6 w-6" />
              </div>
              <DialogTitle>구매하셨나요?</DialogTitle>
              <DialogDescription>
                확인이 필요한 상품이 {purchaseConfirmationChecks.length}개 있습니다.
              </DialogDescription>
            </DialogHeader>

            <Carousel setApi={setPurchaseCarouselApi} opts={{ align: 'start' }}>
              <CarouselContent>
                {purchaseConfirmationChecks.map((check) => (
                  <CarouselItem key={check.id}>
                    <div className="rounded-lg bg-muted px-4 py-3">
                      <p className="text-sm leading-6 text-muted-foreground">
                        {check.storeName}에서 {check.productName} 상품을 확인했습니다.
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">확인한 금액</p>
                      <p className="mt-1 text-base font-bold text-primary">
                        배송비 포함 {check.totalPrice.toLocaleString()}원
                      </p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {purchaseConfirmationChecks.length > 1 && (
              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => purchaseCarouselApi?.scrollPrev()}
                  aria-label="이전 구매 확인"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center justify-center gap-2">
                  {purchaseConfirmationChecks.map((check, index) => (
                    <button
                      key={check.id}
                      type="button"
                      aria-label={`${index + 1}번째 구매 확인 보기`}
                      className={`h-2.5 w-2.5 rounded-full border transition-colors ${
                        selectedPurchaseIndex === index
                          ? 'border-foreground bg-foreground'
                          : 'border-muted-foreground/40 bg-background'
                      }`}
                      onClick={() => purchaseCarouselApi?.scrollTo(index)}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => purchaseCarouselApi?.scrollNext()}
                  aria-label="다음 구매 확인"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  currentPurchaseConfirmationCheck &&
                  handleResolvePurchaseConfirmation(currentPurchaseConfirmationCheck.id)
                }
              >
                아니요
              </Button>
              <Button
                onClick={() =>
                  currentPurchaseConfirmationCheck &&
                  handleResolvePurchaseConfirmation(currentPurchaseConfirmationCheck.id)
                }
              >
                구매했어요
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Link Analysis Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <LinkIcon className="h-5 w-5 text-primary" />
            링크로 분석하기
          </CardTitle>
          <CardDescription>
            해외 쇼핑몰 상품 URL을 붙여넣어 성분을 분석할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="default" className="w-full">
                링크로 가져오기
              </Button>
            </DrawerTrigger>
            <DrawerContent className="mx-auto max-w-[411px] rounded-t-xl bg-[#f7f8ff] px-3 pb-10 pt-2">
              <DrawerHeader className="px-1 pb-3 text-left">
                <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/25" />
                <div className="flex items-center justify-between">
                  <DrawerTitle className="text-sm font-semibold text-primary">
                    링크로 상품 가져오기
                  </DrawerTitle>
                  <DrawerClose asChild>
                    <button
                      type="button"
                      className="inline-flex size-7 items-center justify-center rounded-full text-primary/70 active:bg-muted"
                      aria-label="닫기"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </DrawerClose>
                </div>
                <DrawerDescription className="sr-only">
                  상품 URL을 입력하거나 쇼핑몰을 선택할 수 있습니다.
                </DrawerDescription>
              </DrawerHeader>

              <div className="flex flex-col gap-5">
                <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-white px-2">
                  <Input
                    type="url"
                    placeholder="상품 URL을 입력하세요"
                    value={importUrl}
                    onChange={(event) => setImportUrl(event.target.value)}
                    className="h-7 border-0 bg-transparent px-1 text-[11px] shadow-none focus-visible:ring-0"
                  />
                  <button
                    type="button"
                    onClick={handlePasteImportUrl}
                    className="inline-flex h-6 shrink-0 items-center gap-1 rounded bg-secondary px-2 text-[10px] font-semibold text-primary"
                  >
                    <Clipboard className="h-3 w-3" />
                    붙여넣기
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-border" />
                  <p className="text-[10px] text-muted-foreground">또는 쇼핑몰을 선택해 주세요</p>
                  <span className="h-px flex-1 bg-border" />
                </div>

                <div className="grid grid-cols-3 gap-x-6 gap-y-5 px-3">
                  {supportedShoppingMalls.map((mall) => (
                    <a
                      key={mall.name}
                      href={mall.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 text-center"
                    >
                      <span
                        className={cn(
                          'flex size-12 items-center justify-center rounded-lg text-xs font-black text-white shadow-sm',
                          mall.className
                        )}
                      >
                        {mall.shortName || (
                          <ShoppingBag className="h-6 w-6 text-white" strokeWidth={2.1} />
                        )}
                      </span>
                      <span className="text-[10px] font-medium text-primary">{mall.name}</span>
                    </a>
                  ))}
                  <DrawerClose asChild>
                    <Link href="/import" className="flex flex-col items-center gap-2 text-center">
                      <span className="flex size-12 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
                        <LinkIcon className="h-6 w-6" />
                      </span>
                      <span className="text-[10px] font-medium text-primary">직접 분석</span>
                    </Link>
                  </DrawerClose>
                </div>

                <Button asChild className="mx-3 mt-1 h-10">
                  <Link href="/import">
                    분석 화면으로 이동
                  </Link>
                </Button>
              </div>
            </DrawerContent>
          </Drawer>
        </CardContent>
      </Card>

      {/* Realtime Search Keywords */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">실시간 검색 TOP 10</h2>
          <span className="text-xs text-muted-foreground">방금 업데이트</span>
        </div>
        <div className="rounded-lg border border-border bg-card">
          {realtimeSearchKeywords.map((item, index) => {
            const product = mockProducts.find((mockProduct) => mockProduct.id === item.productId);

            return (
              <Link
                key={`${item.productId}-${item.name}`}
                href={`/product/${item.productId}`}
                className="flex items-center gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/50"
              >
                <span className="w-5 text-center text-sm font-bold text-primary">
                  {index + 1}
                </span>
                <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                  {product?.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={`${product.name} 상품 이미지`}
                      className="h-full w-full object-contain p-1.5"
                      loading="lazy"
                    />
                  ) : (
                    <Package className="h-6 w-6 text-muted-foreground" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {item.name}
                  </span>
                  {product?.variantLabel && (
                    <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                      {product.variantLabel}
                    </span>
                  )}
                  {product && product.purposeTags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {product.purposeTags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-primary/15 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {product && (
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <SafetyBadge
                      status={product.status}
                      className="rounded-md px-1.5 py-0 text-[10px]"
                    />
                    <span className="text-xs font-bold text-primary">
                      {product.price.toLocaleString()}원
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

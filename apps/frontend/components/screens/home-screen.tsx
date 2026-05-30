'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
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
import { Switch } from '@/components/ui/switch';
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Link from 'next/link';

const supportedShoppingMalls = [
  { name: '아마존', shortName: 'A', url: 'https://www.amazon.com' },
  { name: '이베이', shortName: 'E', url: 'https://www.ebay.com' },
  { name: '아이허브', shortName: 'iH', url: 'https://kr.iherb.com' },
  { name: '비타트라', shortName: 'V', url: 'https://www.vitatra.com' },
  { name: '오플닷컴', shortName: 'O', url: 'https://www.ople.com' },
  { name: '쿠팡', shortName: 'C', url: 'https://www.coupang.com' },
  { name: '네이버 가격비교', shortName: 'N', url: 'https://search.shopping.naver.com' },
  { name: '11번가', shortName: '11', url: 'https://www.11st.co.kr' },
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

const PURCHASE_CONFIRMATION_COOKIE_NAME = 'safe_buy_purchase_confirmation_enabled';
const PURCHASE_CONFIRMATION_STORAGE_NAME = 'safe-buy:purchase-confirmation-enabled';

function getPurchaseConfirmationCookie() {
  if (typeof document === 'undefined') {
    return true;
  }

  const cookie = document.cookie
    .split('; ')
    .find((value) => value.startsWith(`${PURCHASE_CONFIRMATION_COOKIE_NAME}=`));

  if (cookie) {
    return cookie.split('=')[1] !== 'false';
  }

  return window.localStorage.getItem(PURCHASE_CONFIRMATION_STORAGE_NAME) !== 'false';
}

function setPurchaseConfirmationCookie(isEnabled: boolean) {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);

  document.cookie = `${PURCHASE_CONFIRMATION_COOKIE_NAME}=${String(
    isEnabled
  )}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  window.localStorage.setItem(PURCHASE_CONFIRMATION_STORAGE_NAME, String(isEnabled));
}

export function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
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
    setIsPurchaseConfirmationEnabled(getPurchaseConfirmationCookie());
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

  const handleTogglePurchaseConfirmation = (isEnabled: boolean) => {
    setIsPurchaseConfirmationEnabled(isEnabled);
    setPurchaseConfirmationCookie(isEnabled);
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      <div className="fixed left-3 top-3 z-[60] flex items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-2 text-xs font-medium text-foreground shadow-sm backdrop-blur">
        <span>구매확인</span>
        <Switch
          checked={isPurchaseConfirmationEnabled}
          onCheckedChange={handleTogglePurchaseConfirmation}
          aria-label="구매확인 알림"
        />
        {purchaseConfirmationChecks.length > 0 && (
          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
            {purchaseConfirmationChecks.length}
          </span>
        )}
      </div>

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
            <DrawerContent className="mx-auto max-w-md rounded-t-3xl">
              <DrawerHeader className="px-5 text-left">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <DrawerTitle className="text-lg">상품 링크 가져오기</DrawerTitle>
                    <DrawerDescription>
                      지원 쇼핑몰에서 상품 링크를 복사한 뒤 분석할 수 있습니다.
                    </DrawerDescription>
                  </div>
                  <DrawerClose asChild>
                    <button
                      type="button"
                      className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="닫기"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </DrawerClose>
                </div>
              </DrawerHeader>

              <div className="flex flex-col gap-6 px-5 pb-8">
                <DrawerClose asChild>
                  <Link
                    href="/import"
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <LinkIcon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">링크로 상품 추가</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          복사한 상품 URL을 붙여넣기
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                </DrawerClose>

                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">
                      지원 쇼핑몰 바로가기
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {supportedShoppingMalls.map((mall) => (
                      <a
                        key={mall.name}
                        href={mall.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-12 items-center gap-2 rounded-full bg-muted px-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                      >
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                          {mall.shortName}
                        </span>
                        <span className="truncate">{mall.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
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
          {realtimeSearchKeywords.map((item, index) => (
            <Link
              key={`${item.productId}-${item.name}`}
              href={`/product/${item.productId}`}
              className="flex items-center gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/50"
            >
              <span className="w-5 text-center text-sm font-bold text-primary">
                {index + 1}
              </span>
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                <Package className="h-6 w-6 text-muted-foreground" />
              </span>
              <span className="flex-1 text-sm font-medium text-foreground">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
